'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { actionCenterApi } from '@/lib/queries';
import { DashboardFilters, Recommendation, Task } from '@/lib/types';
import { Icons } from '@/components/atoms/Icons';
import { Pager } from '@/components/atoms/Pager';
import { LoadingState } from '@/components/molecules/States';

interface Props {
  filters: DashboardFilters;
  onToast: (msg: string, sub: string | null, kind: string) => void;
}

const SEVERITY: Record<string, { cls: string; label: string }> = {
  roas_below_one: { cls: 'alert', label: 'Crítico' },
  reconciliation_gap: { cls: 'warn', label: 'Reconciliar' },
  best_audience_origin: { cls: 'good', label: 'Oportunidad' },
};

export function ActionCenter({ filters, onToast }: Props) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'recs' | 'tasks'>('recs');
  const [page, setPage] = useState(1);

  const recs = useQuery({
    queryKey: ['recommendations', filters],
    queryFn: () => actionCenterApi.recommendations(filters),
  });
  const tasks = useQuery({
    queryKey: ['tasks', page],
    queryFn: () => actionCenterApi.tasks(page),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['tasks'] });
    qc.invalidateQueries({ queryKey: ['recommendations'] });
  };
  const accept = useMutation({
    mutationFn: (r: Recommendation) => actionCenterApi.accept(r),
    onSuccess: () => {
      invalidate();
      onToast('Tarea creada', 'Cruce marketing × POS', 'ok');
    },
  });
  const dismiss = useMutation({
    mutationFn: (r: Recommendation) => actionCenterApi.dismiss(r),
    onSuccess: () => {
      invalidate();
      onToast('Recomendación descartada', null, 'info');
    },
  });
  const complete = useMutation({
    mutationFn: (id: string) => actionCenterApi.complete(id),
    onSuccess: () => {
      invalidate();
      onToast('Tarea completada', '¡Buen trabajo!', 'ok');
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => actionCenterApi.remove(id),
    onSuccess: invalidate,
  });

  const recList = recs.data ?? [];
  const taskList = tasks.data?.items ?? [];
  const openCount = taskList.filter((t) => t.status !== 'done').length;

  return (
    <div className="rail-inner">
      <div className="rail-head">
        <div className="rail-title">
          <span className="spark" />
          Action Center
        </div>
      </div>
      <div className="rail-sub">
        Recomendaciones derivadas de tus datos reales — conviértelas en tareas.
      </div>

      <div className="rail-tabs">
        <button className={tab === 'recs' ? 'on' : ''} onClick={() => setTab('recs')}>
          Sugerencias <span className="badge-n">{recList.length}</span>
        </button>
        <button className={tab === 'tasks' ? 'on' : ''} onClick={() => setTab('tasks')}>
          Tareas <span className={'badge-n' + (openCount ? '' : ' muted')}>{openCount}</span>
        </button>
      </div>

      {tab === 'recs' &&
        (recs.isLoading ? (
          <LoadingState />
        ) : recList.length === 0 ? (
          <EmptyMini icon={<Icons.check />} title="Todo bajo control" />
        ) : (
          recList.map((r) => (
            <RecCard
              key={r.title}
              rec={r}
              onAccept={() => accept.mutate(r)}
              onDismiss={() => dismiss.mutate(r)}
            />
          ))
        ))}

      {tab === 'tasks' &&
        (tasks.isLoading ? (
          <LoadingState />
        ) : taskList.length === 0 ? (
          <EmptyMini icon={<Icons.bolt />} title="Sin tareas aún" />
        ) : (
          <>
            {taskList.map((t) => (
              <TaskItem
                key={t.id}
                task={t}
                onComplete={() => complete.mutate(t.id)}
                onRemove={() => remove.mutate(t.id)}
              />
            ))}
            {tasks.data && (
              <Pager page={tasks.data.page} totalPages={tasks.data.totalPages} onChange={setPage} />
            )}
          </>
        ))}
    </div>
  );
}

function RecCard({
  rec,
  onAccept,
  onDismiss,
}: {
  rec: Recommendation;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  const sev = SEVERITY[rec.rule] ?? { cls: 'info', label: 'Insight' };
  return (
    <div className={'rec ' + sev.cls}>
      <div className="rec-top">
        <span className="rec-sev">{sev.label}</span>
      </div>
      <div className="rec-title">{rec.title}</div>
      <div className="rec-ctx">{rec.context}</div>
      <div className="rec-meta">
        <span className="rm">
          <Icons.owner /> {rec.owner}
        </span>
      </div>
      <div className="rec-actions">
        <button className="acc" onClick={onAccept}>
          <Icons.check style={{ width: 14, height: 14 }} /> Aceptar
        </button>
        <button className="dis" onClick={onDismiss}>
          Descartar
        </button>
      </div>
    </div>
  );
}

function TaskItem({
  task,
  onComplete,
  onRemove,
}: {
  task: Task;
  onComplete: () => void;
  onRemove: () => void;
}) {
  const done = task.status === 'done';
  return (
    <div className={'task' + (done ? ' done' : '')}>
      <div className="chk" onClick={done ? onRemove : onComplete}>
        <Icons.check />
      </div>
      <div className="t-body">
        <div className="t-title">{task.title}</div>
        <div className="t-meta">
          <span className="owner">
            <Icons.owner /> {task.owner}
          </span>
          <span>
            <Icons.cal /> {task.suggestedDate}
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyMini({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="state-box" style={{ padding: '40px 10px' }}>
      <div className="state-ico" style={{ width: 52, height: 52 }}>
        {icon}
      </div>
      <div className="state-title" style={{ fontSize: 17 }}>
        {title}
      </div>
    </div>
  );
}
