import { AppError } from '../utils/AppError';
import { StudyPlan, Subject, Topic } from '../models/index';

export const assertPlanOwnership = async (userId: string, planId: string) => {
  const plan = await StudyPlan.findOne({ where: { id: planId, userId } });
  if (!plan) {
    throw new AppError('Plano não encontrado', 404);
  }
  return plan;
};

export const assertSubjectOwnership = async (userId: string, subjectId: string) => {
  const subject = await Subject.findByPk(subjectId, { include: ['plan'] });
  if (!subject || subject.plan?.userId !== userId) {
    throw new AppError('Disciplina não encontrada', 404);
  }
  return subject;
};

export const assertTopicOwnership = async (userId: string, topicId: string) => {
  const topic = await Topic.findByPk(topicId, { include: [{ association: 'subject', include: ['plan'] }] });
  if (!topic || topic.subject?.plan?.userId !== userId) {
    throw new AppError('Tópico não encontrado', 404);
  }
  return topic;
};
