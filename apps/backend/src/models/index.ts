import './User';
import './UserSettings';
import './StudyPlan';
import './Subject';
import './Topic';
import './StudyLog';
import './ErrorLog';
import './SimulatedExam';
import './SavedNote';
import './UserDriveAuth';
import './PasswordResetToken';

import { User } from './User';
import { UserSettings } from './UserSettings';
import { StudyPlan } from './StudyPlan';
import { Subject } from './Subject';
import { Topic } from './Topic';
import { StudyLog } from './StudyLog';
import { ErrorLog } from './ErrorLog';
import { SimulatedExam } from './SimulatedExam';
import { SavedNote } from './SavedNote';
import { UserDriveAuth } from './UserDriveAuth';
import { PasswordResetToken } from './PasswordResetToken';

User.hasMany(StudyPlan, { foreignKey: 'userId', as: 'plans', onDelete: 'CASCADE' });
StudyPlan.belongsTo(User, { foreignKey: 'userId', as: 'user' });

StudyPlan.hasMany(Subject, { foreignKey: 'planId', as: 'subjects', onDelete: 'CASCADE' });
Subject.belongsTo(StudyPlan, { foreignKey: 'planId', as: 'plan' });

Subject.hasMany(Topic, { foreignKey: 'subjectId', as: 'topics', onDelete: 'CASCADE' });
Topic.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

Subject.hasMany(StudyLog, { foreignKey: 'subjectId', as: 'logs', onDelete: 'CASCADE' });
StudyLog.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
StudyLog.belongsTo(Topic, { foreignKey: 'topicId', as: 'topic' });

Subject.hasMany(ErrorLog, { foreignKey: 'subjectId', as: 'errorLogs', onDelete: 'CASCADE' });
ErrorLog.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

StudyPlan.hasMany(SimulatedExam, { foreignKey: 'planId', as: 'simulatedExams', onDelete: 'CASCADE' });
SimulatedExam.belongsTo(StudyPlan, { foreignKey: 'planId', as: 'plan' });

StudyPlan.hasMany(SavedNote, { foreignKey: 'planId', as: 'savedNotes', onDelete: 'CASCADE' });
SavedNote.belongsTo(StudyPlan, { foreignKey: 'planId', as: 'plan' });
SavedNote.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

User.hasOne(UserSettings, { foreignKey: 'userId', as: 'settings', onDelete: 'CASCADE' });
UserSettings.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(UserDriveAuth, { foreignKey: 'userId', as: 'driveAuth', onDelete: 'CASCADE' });
UserDriveAuth.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(PasswordResetToken, { foreignKey: 'userId', as: 'resetTokens', onDelete: 'CASCADE' });
PasswordResetToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export {
  User,
  UserSettings,
  StudyPlan,
  Subject,
  Topic,
  StudyLog,
  ErrorLog,
  SimulatedExam,
  SavedNote,
  UserDriveAuth,
  PasswordResetToken
};
