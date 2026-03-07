import React, { useState } from 'react';
import { SimulatedExam } from '../types';

interface SimulatedExamsProps {
    exams: SimulatedExam[];
    onAddExam: (exam: SimulatedExam) => void;
    onEditExam: (exam: SimulatedExam) => void;
    onDeleteExam: (id: string) => void;
}

export const SimulatedExams: React.FC<SimulatedExamsProps> = ({ exams, onAddExam, onEditExam, onDeleteExam }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
    // Form States
    const [title, setTitle] = useState('');
    const [institution, setInstitution] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [totalQuestions, setTotalQuestions] = useState(100);
    const [correctAnswers, setCorrectAnswers] = useState(0);

    const sortedExams = [...exams].sort((a, b) => {
        const dateA = typeof a.date === 'string' ? new Date(a.date) : (a.date as Date);
        const dateB = typeof b.date === 'string' ? new Date(b.date) : (b.date as Date);
        return dateB.getTime() - dateA.getTime();
    });

    const handleOpenEdit = (exam: SimulatedExam) => {
        setTitle(exam.title);
        setInstitution(exam.institution);
        setDate((typeof exam.date === 'string' ? new Date(exam.date) : (exam.date as Date)).toISOString().split('T')[0]);
        setTotalQuestions(exam.totalQuestions);
        setCorrectAnswers(exam.correctAnswers);
        setEditingId(exam.id);
        setIsEditing(true);
    };

    const handleCloseModal = () => {
        setIsAdding(false);
        setIsEditing(false);
        setEditingId(null);
        setTitle('');
        setInstitution('');
        setCorrectAnswers(0);
        setTotalQuestions(100);
        setDate(new Date().toISOString().split('T')[0]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || totalQuestions <= 0) return;

        const newExam: SimulatedExam = {
            id: Date.now().toString(),
            planId: 'current', // Será gerido pelo App.tsx idealmente, mas simplificado aqui
            title,
            institution: institution || 'Autoral',
            date: new Date(date).toISOString(),
            totalQuestions,
            correctAnswers,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            notes: ''
        };

        if (isEditing && editingId) {
            onEditExam({ ...newExam, id: editingId });
        } else {
            onAddExam(newExam);
        }
        
        handleCloseModal();
    };

    // Componente de Gráfico de Linha para Evolução
    const EvolutionChart = () => {
        if (sortedExams.length < 2) return (
             <div className="h-48 flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">show_chart</span>
                <p className="text-sm">Registre pelo menos 2 simulados para ver sua evolução.</p>
            </div>
        );

        // O gráfico evolui cronologicamente da esquerda pra direita, 
        // mas o array foi revertido na extração sortedExams. Ele é do Mais novo -> Mais velho
        // Então reverter ele torna do Mais Velho -> Mais Novo.
        const chartData = [...sortedExams].reverse().map(e => {
            const dateObj = typeof e.date === 'string' ? new Date(e.date) : (e.date as Date);
            return {
                date: (dateObj as Date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit'}),
                pct: Math.round((e.correctAnswers / e.totalQuestions) * 100)
            };
        });

        const height = 200; 
        const width = 600; 
        const paddingX = 40; 
        const paddingY = 30;
        const maxY = 100; 
        const xStep = (width - paddingX * 2) / (chartData.length - 1);
        
        const getY = (val: number) => height - paddingY - ((val / maxY) * (height - paddingY * 2));
        
        const points = chartData.map((d, i) => `${paddingX + (i * xStep)},${getY(d.pct)}`).join(' ');

        return (
            <div className="w-full h-56 relative bg-white dark:bg-[#1a1a2e] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm overflow-hidden">
                <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">trending_up</span>
                    Evolução de Desempenho (%)
                </h3>
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    {/* Linhas de Grade */}
                    {[20, 40, 60, 80, 100].map(val => (
                        <g key={val}>
                            <line x1={paddingX} y1={getY(val)} x2={width - paddingX} y2={getY(val)} stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeDasharray="4,4" />
                            <text x={paddingX - 10} y={getY(val) + 4} className="text-[10px] fill-slate-400 text-right">{val}%</text>
                        </g>
                    ))}
                    
                    {/* Linha do Gráfico */}
                    <polyline points={points} fill="none" stroke="currentColor" className="text-primary" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {/* Pontos */}
                    {chartData.map((d, i) => (
                        <g key={i}>
                            <circle cx={paddingX + (i * xStep)} cy={getY(d.pct)} r="5" className="fill-white dark:fill-[#1a1a2e] stroke-primary stroke-2" />
                            <text x={paddingX + (i * xStep)} y={getY(d.pct) - 15} className="text-[10px] fill-slate-600 dark:fill-slate-300 font-bold" textAnchor="middle">{d.pct}%</text>
                        </g>
                    ))}
                    
                    {/* Eixo X - Datas por baixo de tudo */}
                    {chartData.map((d, i) => (
                        <text key={`date-${i}`} x={paddingX + (i * xStep)} y={height - 10} className="text-[10px] fill-slate-500 font-medium" textAnchor="middle">{d.date}</text>
                    ))}
                </svg>
            </div>
        );
    };

    return (
        <div className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <span className="material-symbols-outlined text-4xl text-primary">history_edu</span>
                        Simulados
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Acompanhe sua evolução. "Treino difícil, jogo fácil."
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`} title="Grade">
                            <span className="material-symbols-outlined text-[20px]">grid_view</span>
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`} title="Lista">
                            <span className="material-symbols-outlined text-[20px]">view_list</span>
                        </button>
                    </div>
                    <button 
                        onClick={() => { handleCloseModal(); setIsAdding(true); }}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-95 text-sm md:text-base"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Novo<span className="hidden md:inline"> Simulado</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-8">
                {/* Gráfico de Evolução */}
                <EvolutionChart />

                {/* Lista de Simulados */}
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
                    {sortedExams.map(exam => {
                        const percentage = Math.round((exam.correctAnswers / exam.totalQuestions) * 100);
                        let gradeColor = 'text-red-500 bg-red-50 dark:bg-red-900/20';
                        if (percentage >= 80) gradeColor = 'text-green-500 bg-green-50 dark:bg-green-900/20';
                        else if (percentage >= 60) gradeColor = 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';

                        if (viewMode === 'list') {
                            return (
                                <div key={exam.id} className="bg-white dark:bg-[#1a1a2e] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all group relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`flex flex-col items-center justify-center size-12 rounded-lg shrink-0 ${gradeColor}`}>
                                            <span className="text-sm font-black">{percentage}%</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">{exam.title}</h3>
                                                <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{exam.institution}</span>
                                            </div>
                                            <span className="text-xs text-slate-500 flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                                {(typeof exam.date === 'string' ? new Date(exam.date) : exam.date).toLocaleDateString()}
                                                <span className="mx-1">•</span>
                                                {exam.correctAnswers} de {exam.totalQuestions} acertos
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-48 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden shrink-0">
                                        <div className={`h-full ${percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${percentage}%` }}></div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity self-end md:self-auto">
                                        <button onClick={() => handleOpenEdit(exam)} className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Editar">
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                        </button>
                                        <button onClick={() => onDeleteExam(exam.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Remover">
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={exam.id} className="bg-white dark:bg-[#1a1a2e] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all group relative flex flex-col justify-between">
                                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all bg-white/90 dark:bg-[#1a1a2e]/90 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 z-10">
                                    <button onClick={() => handleOpenEdit(exam)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors" title="Editar">
                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                    </button>
                                    <button onClick={() => onDeleteExam(exam.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Remover">
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </div>

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">{exam.institution}</span>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{exam.title}</h3>
                                        <span className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                            {(typeof exam.date === 'string' ? new Date(exam.date) : exam.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className={`flex flex-col items-center justify-center size-14 rounded-xl ${gradeColor}`}>
                                        <span className="text-xl font-black">{percentage}%</span>
                                    </div>
                                </div>

                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                                    <div className={`h-full ${percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${percentage}%` }}></div>
                                </div>

                                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    <span>Acertos: <strong className="text-slate-900 dark:text-white">{exam.correctAnswers}</strong></span>
                                    <span>Total: <strong className="text-slate-900 dark:text-white">{exam.totalQuestions}</strong></span>
                                </div>
                            </div>
                        );
                    })}
                    
                    {exams.length === 0 && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 opacity-60 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                            <span className="material-symbols-outlined text-5xl mb-2">history_edu</span>
                            <p>Nenhum simulado registrado.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Adição/Edição */}
            {(isAdding || isEditing) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1a1a2e] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 relative">
                        <button onClick={handleCloseModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                            {isEditing ? 'Editar Simulado' : 'Registrar Resultado'}
                        </h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase text-slate-500">Nome do Simulado</label>
                                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Simulado Nacional INSS" className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase text-slate-500">Banca / Instituição</label>
                                <input type="text" value={institution} onChange={e => setInstitution(e.target.value)} placeholder="Ex: Cebraspe, Qconcursos..." className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase text-slate-500">Data Realização</label>
                                <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase text-slate-500">Total Questões</label>
                                    <input required type="number" min="1" value={totalQuestions} onChange={e => setTotalQuestions(parseInt(e.target.value))} className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase text-slate-500">Acertos</label>
                                    <input required type="number" min="0" max={totalQuestions} value={correctAnswers} onChange={e => setCorrectAnswers(parseInt(e.target.value))} className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Cancelar</button>
                                <button type="submit" className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-blue-600">{isEditing ? 'Atualizar' : 'Salvar'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};