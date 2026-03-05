import { AppError } from '../utils/AppError';
import { sequelize } from '../config/database';
import { User, UserSettings, StudyPlan, Subject, Topic, StudyLog, ErrorLog, SimulatedExam, SavedNote } from '../models';
import { encryptSecret } from '../utils/crypto';

export const buildFullPayload = async (userId: string) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('Usuário não encontrado para sync', 404);
  }

  const settings = await UserSettings.findOne({ where: { userId } });

  const plans = await StudyPlan.findAll({
    where: { userId },
    include: [
      {
        association: 'subjects',
        include: [{ association: 'topics' }, { association: 'logs', separate: true }]
      },
      { association: 'simulatedExams' },
      { association: 'savedNotes' }
    ],
    order: [['createdAt', 'ASC']]
  });

  const errorLogs = await ErrorLog.findAll({
    include: [{
      association: 'subject',
      required: true,
      include: [{ association: 'plan', required: true, where: { userId }, attributes: [] }]
    }],
    order: [['createdAt', 'DESC']]
  });

  const studyLogs = await StudyLog.findAll({
    include: [{
      association: 'subject',
      required: true,
      include: [{ association: 'plan', required: true, where: { userId }, attributes: [] }]
    }],
    order: [['date', 'DESC']]
  });

  const simulatedExams = await SimulatedExam.findAll({
    include: [{ association: 'plan', required: true, where: { userId } }]
  });

  const savedNotes = await SavedNote.findAll({
    include: [
      { association: 'plan', required: true, where: { userId } },
      { association: 'subject', required: false }
    ]
  });

  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    },
    settings,
    plans,
    errorLogs,
    studyLogs,
    simulatedExams,
    savedNotes
  };
};

export const applyFullPayload = async (payload: any, userId: string) => {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Backup inválido', 400);
  }

  const plansPayload = Array.isArray(payload.plans) ? payload.plans : [];
  const errorLogsPayload = Array.isArray(payload.errorLogs) ? payload.errorLogs : [];
  const studyLogsPayload = Array.isArray(payload.studyLogs) ? payload.studyLogs : [];
  const simulatedExamsPayload = Array.isArray(payload.simulatedExams) ? payload.simulatedExams : [];
  const savedNotesPayload = Array.isArray(payload.savedNotes) ? payload.savedNotes : [];
  const settingsPayload = payload.settings && typeof payload.settings === 'object' ? payload.settings : undefined;

  const tx = await sequelize.transaction();
  try {
    const user = await User.findByPk(userId, { transaction: tx });
    if (user && payload.user && typeof payload.user === 'object') {
      const nextName = payload.user.name || user.name;
      const nextEmail = payload.user.email || user.email;
      // Atualiza nome/email para que restauração reflita exatamente o backup
      await user.update({ name: nextName, email: nextEmail }, { transaction: tx });
    }

    const existingPlans = await StudyPlan.findAll({ where: { userId }, attributes: ['id'], transaction: tx });
    const planIds = existingPlans.map((p) => p.id);
    const existingSubjects = planIds.length
      ? await Subject.findAll({ where: { planId: planIds }, attributes: ['id'], transaction: tx })
      : [];
    const subjectIds = existingSubjects.map((s) => s.id);
    const existingTopics = subjectIds.length
      ? await Topic.findAll({ where: { subjectId: subjectIds }, attributes: ['id'], transaction: tx })
      : [];

    if (subjectIds.length) {
      await StudyLog.destroy({ where: { subjectId: subjectIds }, transaction: tx });
      await ErrorLog.destroy({ where: { subjectId: subjectIds }, transaction: tx });
    }
    if (planIds.length) {
      await SimulatedExam.destroy({ where: { planId: planIds }, transaction: tx });
      await SavedNote.destroy({ where: { planId: planIds }, transaction: tx });
    }
    if (existingTopics.length) {
      await Topic.destroy({ where: { id: existingTopics.map((t) => t.id) }, transaction: tx });
    }
    if (subjectIds.length) {
      await Subject.destroy({ where: { id: subjectIds }, transaction: tx });
    }
    if (planIds.length) {
      await StudyPlan.destroy({ where: { id: planIds }, transaction: tx });
    }

    const planIdSet = new Set<string>();

    for (const plan of plansPayload) {
      if (!plan?.id || !plan?.name) continue;

      await StudyPlan.create(
        {
          id: plan.id,
          userId,
          name: plan.name,
          description: plan.description || null,
          color: plan.color || null,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt
        },
        { transaction: tx }
      );
      planIdSet.add(plan.id);

      const subjects = Array.isArray(plan.subjects) ? plan.subjects : [];
      for (const subject of subjects) {
        if (!subject?.id || !subject?.name) continue;

        await Subject.create(
          {
            id: subject.id,
            planId: plan.id,
            name: subject.name,
            active: subject.active !== false,
            color: subject.color || null,
            weight: subject.weight ?? null,
            priority: subject.priority || null,
            proficiency: subject.proficiency || null,
            createdAt: subject.createdAt,
            updatedAt: subject.updatedAt
          },
          { transaction: tx }
        );

        const topics = Array.isArray(subject.topics) ? subject.topics : [];
        for (const topic of topics) {
          if (!topic?.id || !(topic.name || topic.title)) continue;
          await Topic.create(
            {
              id: topic.id,
              subjectId: subject.id,
              name: topic.name || topic.title,
              completed: topic.completed === true,
              createdAt: topic.createdAt,
              updatedAt: topic.updatedAt
            },
            { transaction: tx }
          );
        }
      }
    }

    for (const log of studyLogsPayload) {
      const subjectPlanId = log.planId || log.subject?.planId;
      if (!log?.id || !log?.subjectId || (subjectPlanId && !planIdSet.has(subjectPlanId))) continue;
      await StudyLog.create(
        {
          id: log.id,
          subjectId: log.subjectId,
          topicId: log.topicId || null,
          topicName: log.topicName || 'Tópico',
          date: log.date,
          durationMinutes: log.durationMinutes || 0,
          questionsCount: log.questionsCount || 0,
          correctCount: log.correctCount || 0,
          modalities: log.modalities || null,
          notes: log.notes || null,
          createdAt: log.createdAt,
          updatedAt: log.updatedAt
        },
        { transaction: tx }
      );
    }

    for (const err of errorLogsPayload) {
      if (!err?.id || !err?.subjectId) continue;
      await ErrorLog.create(
        {
          id: err.id,
          subjectId: err.subjectId,
          topicName: err.topicName || 'Tópico',
          questionSource: err.questionSource || 'Desconhecido',
          reason: err.reason,
          description: err.description || '',
          correction: err.correction || '',
          reviewCount: err.reviewCount || 0,
          createdAt: err.createdAt,
          updatedAt: err.updatedAt
        },
        { transaction: tx }
      );
    }

    for (const sim of simulatedExamsPayload) {
      if (!sim?.id || !sim?.planId || !planIdSet.has(sim.planId)) continue;
      await SimulatedExam.create(
        {
          id: sim.id,
          planId: sim.planId,
          title: sim.title || '',
          institution: sim.institution || '',
          date: sim.date,
          totalQuestions: sim.totalQuestions || 0,
          correctAnswers: sim.correctAnswers || 0,
          notes: sim.notes || null,
          createdAt: sim.createdAt,
          updatedAt: sim.updatedAt
        },
        { transaction: tx }
      );
    }

    for (const note of savedNotesPayload) {
      if (!note?.id || !note?.planId || !planIdSet.has(note.planId)) continue;
      await SavedNote.create(
        {
          id: note.id,
          planId: note.planId,
          subjectId: note.subjectId || null,
          content: note.content || '',
          topicName: note.topicName || null,
          tags: note.tags || null,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt
        },
        { transaction: tx }
      );
    }

    if (settingsPayload) {
      const payload = { ...settingsPayload } as any;
      if (payload.openAiApiKey !== undefined) {
        payload.openAiApiKey = payload.openAiApiKey ? encryptSecret(payload.openAiApiKey) : null;
      }
      if (payload.githubToken !== undefined) {
        payload.githubToken = payload.githubToken ? encryptSecret(payload.githubToken) : null;
      }
      const [settings] = await UserSettings.findOrCreate({ where: { userId }, defaults: { ...payload, userId } , transaction: tx });
      await settings.update(payload, { transaction: tx });
    }

    await tx.commit();
  } catch (err) {
    await tx.rollback();
    throw err;
  }
};
