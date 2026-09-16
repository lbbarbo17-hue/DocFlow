# 📄 DocFlow — Especificação de Arquitetura Técnica & Padrão DDD Lite

## 1. Visão Geral da Arquitetura DDD Lite

O **DocFlow** adota a abordagem **DDD Lite (Domain-Driven Design Lite)**, estruturando o backend em três camadas concêntricas e bem delimitadas:

```
┌────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                 │
│  FastAPI (Web API v1) • SQLAlchemy ORM • Storage UUID  │
│  Append-Only Audit Logger • Middlewares & CORS         │
│  ┌──────────────────────────────────────────────────┐  │
│  │                APPLICATION LAYER                 │  │
│  │  Casos de Uso: UploadDoc, ValidateDoc, Redact    │  │
│  │  TurmaMetricsService • DTOs & Schemas Pydantic   │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │                 DOMAIN LAYER               │  │  │
│  │  │  Entidades: Student, Document, AuditLog    │  │  │
│  │  │  Value Objects: CPF, DocumentValidity      │  │  │
│  │  │  Interfaces de Repositório (Contratos)     │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 2. Camada de Domínio (`Domain`)

A camada de domínio é completamente agnóstica a bancos de dados, ORMs ou frameworks HTTP.

### 2.1. Entidades Principais
- **`Student` (Estudante/Aprendiz)**:
  - Atributos: `id (UUID)`, `tenant_id`, `name`, `cpf (CPF)`, `email`, `matricula`, `turma_id`, `status`.
  - Comportamentos: `adicionar_documento()`, `calcular_conformidade_dossie()`, `obter_documentos_a_vencer()`.
- **`Document` (Documento Organizacional)**:
  - Atributos: `id (UUID)`, `student_id`, `tipo (TipoDocumento)`, `storage_path`, `file_hash (FileHash)`, `mime_type`, `tamanho_bytes`, `status (StatusDocumento)`, `validade (DocumentValidity)`, `justificativa_recusa`.
  - Comportamentos: `aprovar(operador_id)`, `recusar(operador_id, justificativa)`, `marcar_expirado()`.
- **`AuditLog` (Registro Imutável)**:
  - Atributos: `id (UUID)`, `tenant_id`, `user_id`, `user_role`, `action`, `resource_id`, `ip_address`, `timestamp_utc`, `status`.

### 2.2. Value Objects
- **`CPF`**: Objeto de valor imutável que valida os 11 dígitos contra o algoritmo de módulo 11 da Receita Federal.
- **`DocumentValidity`**: Controla o período de vigência e expiração do documento, calculando automaticamente se o comprovante está próximo do vencimento (ex: < 30 dias).
- **`FileHash`**: Valida a integridade do arquivo através de hash SHA-256 gerado no momento do upload.

### 2.3. Contratos de Repositório (`IRepository`)
```python
from abc import ABC, abstractmethod
from typing import Optional, List
from uuid import UUID
from app.domain.entities.student import Student
from app.domain.entities.document import Document

class IStudentRepository(ABC):
    @abstractmethod
    async def get_by_id(self, student_id: UUID, tenant_id: UUID) -> Optional[Student]:
        pass

    @abstractmethod
    async def list_by_turma(self, turma_id: UUID, tenant_id: UUID) -> List[Student]:
        pass

class IDocumentRepository(ABC):
    @abstractmethod
    async def save(self, document: Document) -> Document:
        pass

    @abstractmethod
    async def get_by_id(self, document_id: UUID, tenant_id: UUID) -> Optional[Document]:
        pass
```

---

## 3. Camada de Aplicação (`Application`)

Contém os Casos de Uso que orquestram a execução das operações e as regras de negócio:

### 3.1. Casos de Uso Principais
1. **`UploadDocumentUseCase`**:
   - Valida Magic Bytes e tamanho (máx 10 MB);
   - Calcula hash SHA-256;
   - Renomeia para UUID criptográfico;
   - Persiste no storage seguro;
   - Dispara registro na trilha de auditoria.
2. **`ValidateDocumentUseCase`**:
   - Valida perfil do operador (Coordenador ou RH);
   - Se recusado, exige justificativa obrigatória;
   - Atualiza status do documento e notifica o estudante;
   - Grava evento de auditoria imutável.
3. **`AnonymizeLGPDUseCase`**:
   - Aplica tarjamento automático sobre dados sensíveis não indispensáveis.
4. **`GenerateTurmaDashboardUseCase`**:
   - Consolida os dossiês de todos os aprendizes de uma turma;
   - Retorna percentual de regularidade e sinaliza alunos em risco de sanção.

---

## 4. Camada de Infraestrutura (`Infrastructure`)

### 4.1. Inspeção de Magic Bytes
```python
MAGIC_BYTES = {
    b"%PDF-": "application/pdf",
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG\r\n\x1a\n": "image/png",
}

def inspect_magic_bytes(header: bytes) -> str:
    for signature, mime in MAGIC_BYTES.items():
        if header.startswith(signature):
            return mime
    raise InvalidFileSignatureError("Arquivo não possui assinatura binária válida.")
```

### 4.2. Matriz de Endpoints da API REST (FastAPI v1)

| Método | Endpoint | Descrição | Papel Mínimo |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Autenticação e emissão de JWT | Público |
| `GET` | `/api/v1/students/me/checklist` | Consulta do checklist do estudante | Estudante |
| `POST` | `/api/v1/documents/upload` | Upload seguro com validação de Magic Bytes | Estudante |
| `GET` | `/api/v1/dossiers` | Listagem de dossiês por turma/status | Coordenador / RH |
| `GET` | `/api/v1/dossiers/{student_id}` | Visualização detalhada do dossiê | Coordenador / RH |
| `POST` | `/api/v1/documents/{doc_id}/validate` | Aprovação ou recusa fundamentada | Coordenador / RH |
| `GET` | `/api/v1/analytics/turmas` | Painel analítico de encaminhamento | Coordenador / RH |
| `GET` | `/api/v1/audit/logs` | Consulta da trilha de auditoria LGPD | DPO / Admin |
