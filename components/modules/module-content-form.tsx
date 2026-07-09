"use client";

import { useActionState, useState } from "react";

import {
  createModuleContentAction,
  type ModuleActionState,
} from "@/app/actions/modules";
import { ModuleFileUpload } from "@/components/modules/module-file-upload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { ModuleContentType } from "@/lib/domain/modules/types";

const initialState: ModuleActionState = {};

type ModuleContentFormProps = {
  moduleId: string;
  trainingId: string;
};

export function ModuleContentForm({
  moduleId,
  trainingId,
}: ModuleContentFormProps) {
  const [contentType, setContentType] = useState<ModuleContentType>("document");
  const [documentUrl, setDocumentUrl] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentSize, setDocumentSize] = useState<number | undefined>();
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [state, formAction, pending] = useActionState(
    createModuleContentAction,
    initialState,
  );

  return (
    <div className="space-y-4">
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      {state.success ? (
        <Alert>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs
        value={contentType}
        onValueChange={(value) => setContentType(value as ModuleContentType)}
      >
        <TabsList>
          <TabsTrigger value="document">Dokumen</TabsTrigger>
          <TabsTrigger value="video_link">Video Link</TabsTrigger>
          <TabsTrigger value="download_link">Download Link</TabsTrigger>
        </TabsList>

        <TabsContent value="document" className="space-y-4 pt-4">
          <ModuleFileUpload
            purpose="document"
            onUploaded={({ url, size }) => {
              setDocumentUrl(url);
              setDocumentSize(size);
            }}
          />

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="documentTitle">Judul Dokumen</FieldLabel>
              <Input
                id="documentTitle"
                value={documentTitle}
                onChange={(event) => setDocumentTitle(event.target.value)}
                placeholder="Contoh: Modul 1 - Pengenalan"
              />
            </Field>
          </FieldGroup>

          <form action={formAction}>
            <input type="hidden" name="moduleId" value={moduleId} />
            <input type="hidden" name="trainingId" value={trainingId} />
            <input type="hidden" name="type" value="document" />
            <input type="hidden" name="title" value={documentTitle} />
            <input type="hidden" name="url" value={documentUrl} />
            {documentSize !== undefined ? (
              <input type="hidden" name="fileSize" value={documentSize} />
            ) : null}
            <Button
              type="submit"
              disabled={pending || !documentUrl || !documentTitle.trim()}
            >
              {pending ? <Spinner className="size-4" /> : "Tambah Dokumen"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="video_link" className="space-y-4 pt-4">
          <LinkContentFields
            title={linkTitle}
            url={linkUrl}
            onTitleChange={setLinkTitle}
            onUrlChange={setLinkUrl}
            urlPlaceholder="https://youtube.com/watch?v=..."
          />
          <form action={formAction}>
            <input type="hidden" name="moduleId" value={moduleId} />
            <input type="hidden" name="trainingId" value={trainingId} />
            <input type="hidden" name="type" value="video_link" />
            <input type="hidden" name="title" value={linkTitle} />
            <input type="hidden" name="url" value={linkUrl} />
            <Button
              type="submit"
              disabled={pending || !linkTitle.trim() || !linkUrl.trim()}
            >
              {pending ? <Spinner className="size-4" /> : "Tambah Video Link"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="download_link" className="space-y-4 pt-4">
          <LinkContentFields
            title={linkTitle}
            url={linkUrl}
            onTitleChange={setLinkTitle}
            onUrlChange={setLinkUrl}
            urlPlaceholder="https://drive.google.com/..."
          />
          <form action={formAction}>
            <input type="hidden" name="moduleId" value={moduleId} />
            <input type="hidden" name="trainingId" value={trainingId} />
            <input type="hidden" name="type" value="download_link" />
            <input type="hidden" name="title" value={linkTitle} />
            <input type="hidden" name="url" value={linkUrl} />
            <Button
              type="submit"
              disabled={pending || !linkTitle.trim() || !linkUrl.trim()}
            >
              {pending ? <Spinner className="size-4" /> : "Tambah Download Link"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

type LinkContentFieldsProps = {
  title: string;
  url: string;
  urlPlaceholder: string;
  onTitleChange: (value: string) => void;
  onUrlChange: (value: string) => void;
};

function LinkContentFields({
  title,
  url,
  urlPlaceholder,
  onTitleChange,
  onUrlChange,
}: LinkContentFieldsProps) {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="linkTitle">Judul</FieldLabel>
        <Input
          id="linkTitle"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Contoh: Slide Presentasi"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="linkUrl">URL</FieldLabel>
        <Input
          id="linkUrl"
          type="url"
          value={url}
          onChange={(event) => onUrlChange(event.target.value)}
          placeholder={urlPlaceholder}
        />
      </Field>
    </FieldGroup>
  );
}
