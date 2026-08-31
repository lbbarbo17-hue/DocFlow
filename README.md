# 📄 DocFlow — Gestão & Guarda Continuada de Documentos Acadêmicos

> **Plataforma B2B SaaS para centralização, auditoria e guarda segura de documentos de aprendizes e estagiários, projetada sob a arquitetura DDD Lite e estrita conformidade com a LGPD.**

---

## 🎯 1. Visão Geral & Proposta de Valor

No ciclo de vida pós-contratação de aprendizes e estagiários, a gestão documental enfrenta gargalos operacionais e riscos jurídicos severos:

* **Riscos e Sanções LGPD:** Exposição indevida de dados pessoais sensíveis (filiação, biometria) em canais desprotegidos.
* **Cancelamento Indevido de Contratos:** Perda de prazos na renovação de comprovantes de matrícula semestrais, resultando na anulação do vínculo de estágio.
* **Ausência de Trilha de Auditoria:** Falta de rastreabilidade sobre quem visualizou, aprovou, baixou ou rejeitou documentos operacionais.
* **Ameaças Digitais:** Upload de scripts maliciosos camuflados em extensões de arquivo comuns (PDF, PNG, JPG).

O **DocFlow** resolve essas vulnerabilidades combinando isolamento arquitetural por camadas (**DDD Lite**), guard-rails automáticos de segurança e dashboards analíticos por turma.

---

## 🏗️ 2. Arquitetura de Software: Padrão DDD Lite

O sistema adota a abordagem **DDD Lite (Domain-Driven Design Lite)**, desacoplando completamente as regras puras de negócio dos frameworks web e mecanismos de persistência.

```text
┌────────────────────────────────────────────────────────┐
│                INFRASTRUCTURE LAYER                    │
│  FastAPI (Web API v1) • SQLAlchemy ORM • Storage UUID  │
│  Append-Only Audit Logger • Middlewares & CORS         │
│  ┌──────────────────────────────────────────────────┐  │
│  │                APPLICATION LAYER                 │  │
│  │  Casos de Uso: UploadDoc, ValidateDoc, Redact    │  │
│  │  TurmaMetricsService • DTOs & Schemas Pydantic   │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │                DOMAIN LAYER                │  │  │
│  │  │  Entidades: Student, Document, AuditLog    │  │  │
│  │  │  Value Objects: CPF, DocumentValidity      │  │  │
│  │  │  Interfaces de Repositório (Contratos)     │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘