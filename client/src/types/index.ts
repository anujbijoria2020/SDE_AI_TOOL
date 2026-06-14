export interface User {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface FunctionalRequirement {
  id: string;
  title: string;
  description: string;
}

export interface NonFunctionalRequirement {
  id: string;
  type: string;
  description: string;
}

export interface SRS {
  project_title: string;
  purpose: string;
  scope: string;
  user_classes: string[];
  functional_requirements: FunctionalRequirement[];
  non_functional_requirements: NonFunctionalRequirement[];
  constraints: string[];
}

export interface GeneratedArtifacts {
  srs: SRS;
  erd_mermaid: string;
  class_diagram_mermaid: string;
  sequence_diagram_mermaid: string;
  sql_schema: string;
}

export interface GenerateResponse {
  success: boolean;
  "Project ID": number;
  title: string;
  data: GeneratedArtifacts;
}

export interface GeneratedArtifactOut {
  id: number;
  project_id: number;
  artifact_type: "srs" | "erd_mermaid" | "class_diagram_mermaid" 
    | "sequence_diagram_mermaid" | "sql_schema";
  content: string;
  created_at: string;
}

export interface ProjectOut {
  id: number;
  title: string;
  description: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
  artifacts: GeneratedArtifactOut[];
}

export interface ProjectListItem {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}
