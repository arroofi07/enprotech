"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconGripVertical } from "@tabler/icons-react";
import { useActionState, useEffect, useState } from "react";

import {
  reorderModulesAction,
  type ModuleActionState,
} from "@/app/actions/modules";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { ModuleWithContents } from "@/lib/infrastructure/db/repositories/module-repository";
import { cn } from "@/lib/utils";

const initialState: ModuleActionState = {};

type ModuleSortableListProps = {
  modules: ModuleWithContents[];
  trainingId: string;
  renderModule: (module: ModuleWithContents) => React.ReactNode;
};

export function ModuleSortableList({
  modules,
  trainingId,
  renderModule,
}: ModuleSortableListProps) {
  const [items, setItems] = useState(modules);
  const [state, formAction, pending] = useActionState(
    reorderModulesAction,
    initialState,
  );

  useEffect(() => {
    setItems(modules);
  }, [modules]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setItems((current) => {
      const oldIndex = current.findIndex((item) => item.id === active.id);
      const newIndex = current.findIndex((item) => item.id === over.id);
      return arrayMove(current, oldIndex, newIndex);
    });
  }

  return (
    <div className="space-y-4">
      {state.message ? (
        <Alert>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {items.map((module) => (
              <SortableModuleItem key={module.id} id={module.id}>
                {renderModule(module)}
              </SortableModuleItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <form action={formAction}>
        <input type="hidden" name="trainingId" value={trainingId} />
        {items.map((item) => (
          <input key={item.id} type="hidden" name="moduleIds" value={item.id} />
        ))}
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? <Spinner className="size-4" /> : "Simpan Urutan Modul"}
        </Button>
      </form>
    </div>
  );
}

type SortableModuleItemProps = {
  id: string;
  children: React.ReactNode;
};

function SortableModuleItem({ id, children }: SortableModuleItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "flex items-start gap-2 rounded-lg border bg-card",
        isDragging && "opacity-70 shadow-md",
      )}
    >
      <button
        type="button"
        className="mt-4 ml-2 cursor-grab text-muted-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Seret untuk mengatur urutan"
      >
        <IconGripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
