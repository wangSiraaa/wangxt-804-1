import { useState } from 'react';
import type { Assignment, Annotation, AnnotationType, User } from '@/types';
import { AnnotationTypeLabels } from '@/types';
import { formatTime, getStatusLabel, getRoleLabel } from '@/utils/dateUtils';

interface WorkstationCardProps {
  workstation: { id: string; code: string; name: string; type: string };
  assignment: Assignment | null;
  technicianName: string;
  vehicleInfo: string;
  annotations: Annotation[];
  currentUser: User;
  onAddAnnotation: (assignmentId: string, type: AnnotationType, content: string) => void;
}

export default function WorkstationCard({
  workstation,
  assignment,
  technicianName,
  vehicleInfo,
  annotations,
  currentUser,
  onAddAnnotation,
}: WorkstationCardProps) {
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);
  const [annotationType, setAnnotationType] = useState<AnnotationType>('repair_note');
  const [annotationContent, setAnnotationContent] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const getAnnotationTypeColor = (type: AnnotationType) => {
    switch (type) {
      case 'repair_note':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'reception_note':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'supervisor_conclusion':
        return 'bg-orange-50 border-orange-200 text-orange-700';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  const handleSubmitAnnotation = () => {
    if (!assignment || !annotationContent.trim()) return;
    onAddAnnotation(assignment.id, annotationType, annotationContent.trim());
    setAnnotationContent('');
    setShowAnnotationForm(false);
  };

  const canAddAnnotation = () => {
    if (!assignment) return false;
    if (currentUser.role === 'technician') return true;
    if (currentUser.role === 'reception') return true;
    if (currentUser.role === 'supervisor') return true;
    return false;
  };

  const getAvailableAnnotationTypes = (): { value: AnnotationType; label: string }[] => {
    const types: { value: AnnotationType; label: string }[] = [];
    if (currentUser.role === 'technician') {
      types.push({ value: 'repair_note', label: '维修说明' });
    }
    if (currentUser.role === 'reception') {
      types.push({ value: 'reception_note', label: '前台备注' });
    }
    if (currentUser.role === 'supervisor') {
      types.push({ value: 'supervisor_conclusion', label: '主管结论' });
      types.push({ value: 'repair_note', label: '维修说明' });
      types.push({ value: 'reception_note', label: '前台备注' });
    }
    return types;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-slate-800">{workstation.name}</h3>
            <p className="text-xs text-slate-500 mt-1">{workstation.code} · {workstation.type}</p>
          </div>
          {assignment && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(assignment.status)}`}>
              {getStatusLabel(assignment.status)}
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        {assignment ? (
          <>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-16">技师:</span>
                <span className="text-sm font-medium text-slate-700">{technicianName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-16">车辆:</span>
                <span className="text-sm text-slate-600">{vehicleInfo}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-16">时间:</span>
                <span className="text-sm text-slate-600">
                  {formatTime(assignment.startTime)} - {formatTime(assignment.endTime)}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs text-slate-500 w-16 pt-0.5">任务:</span>
                <span className="text-sm text-slate-600">{assignment.description}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-slate-700">工单批注 ({annotations.length})</h4>
                {canAddAnnotation() && (
                  <button
                    onClick={() => setShowAnnotationForm(!showAnnotationForm)}
                    className="text-xs px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {showAnnotationForm ? '取消' : '+ 添加批注'}
                  </button>
                )}
              </div>

              {showAnnotationForm && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <select
                    value={annotationType}
                    onChange={(e) => setAnnotationType(e.target.value as AnnotationType)}
                    className="w-full mb-2 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {getAvailableAnnotationTypes().map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <textarea
                    value={annotationContent}
                    onChange={(e) => setAnnotationContent(e.target.value)}
                    placeholder="请输入批注内容..."
                    className="w-full mb-2 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowAnnotationForm(false);
                        setAnnotationContent('');
                      }}
                      className="px-3 py-1.5 text-sm text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSubmitAnnotation}
                      disabled={!annotationContent.trim()}
                      className="px-3 py-1.5 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      提交
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {annotations.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">暂无批注</p>
                ) : (
                  annotations.map((ann) => (
                    <div key={ann.id} className={`p-3 rounded-lg border ${getAnnotationTypeColor(ann.type)}`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-medium">
                          {AnnotationTypeLabels[ann.type]}
                        </span>
                        <span className="text-xs opacity-70">
                          {new Date(ann.createdAt).toLocaleString('zh-CN', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm mb-1">{ann.content}</p>
                      <p className="text-xs opacity-70">
                        {ann.authorName} · {getRoleLabel(ann.authorRole)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">工位空闲</p>
          </div>
        )}
      </div>
    </div>
  );
}
