'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { actionCenterApi } from '@/lib/queries';
import { DashboardFilters, Recommendation, Task } from '@/lib/types';
import { LoadingState, EmptyState } from '@/components/states/States';

interface Props {
  filters: DashboardFilters;
}

export function ActionCenter({ filters }: Props) {
  const qc = useQueryClient();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const recs = useQuery({
    queryKey: ['recommendations', filters],
    queryFn: () => actionCenterApi.recommendations(filters),
  });
  const tasks = useQuery({
    queryKey: ['tasks'],
    queryFn: actionCenterApi.tasks,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['tasks'] });
  };

  const accept = useMutation({
    mutationFn: (rec: Recommendation) => actionCenterApi.accept(rec),
    onSuccess: invalidate,
  });
  const complete = useMutation({
    mutationFn: (id: string) => actionCenterApi.complete(id),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => actionCenterApi.remove(id),
    onSuccess: invalidate,
  });

  const acceptedTitles = new Set(tasks.data?.map((t) => t.title));
  const pending = (recs.data ?? []).filter(
    (r) => !acceptedTitles.has(r.title) && !dismissed.has(r.title),
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Recomendaciones">
        {recs.isLoading && <LoadingState />}
        {!recs.isLoading && pending.length === 0 && (
          <EmptyState label="Sin recomendaciones pendientes" />
        )}
        <ul className="space-y-3">
          {pending.map((rec) => (
            <li
              key={rec.title}
              className="rounded-lg border border-slate-800 bg-slate-950/60 p-3"
            >
              <p className="font-medium">{rec.title}</p>
              <p className="mt-1 text-xs text-slate-400">{rec.context}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-500">{rec.owner}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setDismissed((d) => new Set(d).add(rec.title))
                    }
                    className="rounded border border-slate-700 px-3 py-1 text-xs text-slate-400 hover:bg-slate-800"
                  >
                    Descartar
                  </button>
                  <button
                    onClick={() => accept.mutate(rec)}
                    disabled={accept.isPending}
                    className="rounded bg-emerald-500 px-3 py-1 text-xs font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {rec.cta}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Tasks aceptadas">
        {tasks.isLoading && <LoadingState />}
        {tasks.data?.length === 0 && <EmptyState label="Sin tasks aún" />}
        <ul className="space-y-3">
          {tasks.data?.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={() => complete.mutate(task.id)}
              onRemove={() => remove.mutate(task.id)}
            />
          ))}
        </ul>
      </Panel>
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
    <li className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className={`font-medium ${done ? 'text-slate-500 line-through' : ''}`}>
          {task.title}
        </p>
        <span className="shrink-0 text-xs text-slate-500">
          {task.suggestedDate}
        </span>
      </div>
      <div className="mt-3 flex gap-2">
        {!done && (
          <button
            onClick={onComplete}
            className="rounded border border-emerald-500/40 px-3 py-1 text-xs text-emerald-300 hover:bg-emerald-500/10"
          >
            Marcar hecha
          </button>
        )}
        <button
          onClick={onRemove}
          className="rounded border border-slate-700 px-3 py-1 text-xs text-slate-400 hover:bg-slate-800"
        >
          Descartar
        </button>
      </div>
    </li>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <h3 className="mb-3 text-sm font-medium text-slate-300">{title}</h3>
      {children}
    </div>
  );
}
