'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserRole, Turma } from '@/lib/types';
import {
  Users,
  GraduationCap,
  ShieldCheck,
  Settings,
  Plus,
  Search,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import AuditTable from '@/components/audit/AuditTable';
import TurmaRiskTable from '@/components/analytics/TurmaRiskTable';

export default function AdminDashboard() {
  const { systemUsers, updateUserRole, turmas, addNewTurma, studentsList, auditLogs } = useApp();
  const [activeTab, setActiveTab] = useState<'USERS' | 'TURMAS' | 'AUDIT' | 'SETTINGS'>('USERS');
  const [userSearch, setUserSearch] = useState('');
  const [isAddingTurma, setIsAddingTurma] = useState(false);

  // New Turma Form State
  const [newCodigo, setNewCodigo] = useState('');
  const [newCurso, setNewCurso] = useState('');
  const [newPeriodo, setNewPeriodo] = useState('2026.2 - Noite');
  const [newTotalAlunos, setNewTotalAlunos] = useState(25);

  const filteredUsers = systemUsers.filter(
    (u) =>
      u.nome.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.cargo.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleCreateTurma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodigo || !newCurso) return;

    const turma: Turma = {
      id: `turma-${Date.now()}`,
      codigo: newCodigo,
      nomeCurso: newCurso,
      periodo: newPeriodo,
      totalAlunos: Number(newTotalAlunos),
      conformidadeMedia: 100,
      alunosEmRisco: 0,
      alunosRegulares: Number(newTotalAlunos),
    };

    addNewTurma(turma);
    setNewCodigo('');
    setNewCurso('');
    setIsAddingTurma(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Global KPIs Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aprendizes / Dossiês</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{studentsList.length}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Ativos na base central</p>
          </div>
          <div className="p-3 bg-[#065373]/10 text-[#065373] rounded-2xl">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Turmas Monitoradas</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{turmas.length}</p>
            <p className="text-[11px] text-cyan-700 font-semibold mt-0.5">Cursos técnicos e estágios</p>
          </div>
          <div className="p-3 bg-cyan-50 text-cyan-700 rounded-2xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Operadores / Usuários</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{systemUsers.length}</p>
            <p className="text-[11px] text-purple-700 font-semibold mt-0.5">Perfis com credenciais ativas</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registros na Trilha</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{auditLogs.length}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Integridade SHA-256 ativa</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Admin */}
      <div className="flex rounded-2xl bg-white p-1.5 border border-slate-200 shadow-sm overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'USERS'
              ? 'bg-[#065373] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Gestão de Usuários & Perfis ({systemUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TURMAS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'TURMAS'
              ? 'bg-[#065373] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Gestão de Turmas & Cursos ({turmas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'AUDIT'
              ? 'bg-[#065373] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Trilha de Auditoria Geral</span>
        </button>

        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'SETTINGS'
              ? 'bg-[#065373] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configurações & Guard-rails</span>
        </button>
      </div>

      {/* TAB 1: USERS MANAGEMENT */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Usuários e Permissões de Acesso</h3>
              <p className="text-xs text-slate-500">
                Alterne o nível de permissão entre Aprendiz/Estagiário, Coordenador e Super Admin.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Buscar usuário..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#065373]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Nome / Cargo</th>
                  <th className="py-3 px-4">E-mail</th>
                  <th className="py-3 px-4">Perfil Atual</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Último Acesso</th>
                  <th className="py-3 px-4 text-right">Alterar Perfil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{u.nome}</p>
                        <p className="text-[11px] text-slate-500">{u.cargo}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.role === 'SUPERADMIN'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : u.role === 'COORDENADOR'
                            ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {u.role === 'ESTUDANTE'
                          ? 'Aprendiz / Estagiário'
                          : u.role === 'COORDENADOR'
                          ? 'Coordenador (Curso/RH)'
                          : 'Super Admin'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{u.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{u.ultimoAcesso}</td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                        className="text-xs p-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#065373]"
                      >
                        <option value="ESTUDANTE">Aprendiz / Estagiário</option>
                        <option value="COORDENADOR">Coordenador (Curso/RH)</option>
                        <option value="SUPERADMIN">Super Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TURMAS MANAGEMENT */}
      {activeTab === 'TURMAS' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsAddingTurma(true)}
              className="px-4 py-2 bg-[#065373] hover:bg-[#043c53] text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Nova Turma</span>
            </button>
          </div>

          <TurmaRiskTable />

          {/* Add Turma Modal */}
          {isAddingTurma && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="bg-[#065373] text-white p-5 flex items-center justify-between">
                  <h3 className="font-bold text-base">Cadastrar Nova Turma</h3>
                  <button onClick={() => setIsAddingTurma(false)} className="text-white/80 hover:text-white">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateTurma} className="p-6 space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Código da Turma</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: DS-2026.2-N"
                      value={newCodigo}
                      onChange={(e) => setNewCodigo(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#065373]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Nome do Curso Técnico</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Técnico em Mecatrônica & Robótica"
                      value={newCurso}
                      onChange={(e) => setNewCurso(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#065373]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-800">Período Letivo</label>
                      <input
                        type="text"
                        value={newPeriodo}
                        onChange={(e) => setNewPeriodo(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#065373]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-800">Total de Aprendizes</label>
                      <input
                        type="number"
                        min="1"
                        value={newTotalAlunos}
                        onChange={(e) => setNewTotalAlunos(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#065373]"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingTurma(false)}
                      className="px-4 py-2 text-slate-600 rounded-xl font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#065373] text-white rounded-xl font-bold hover:bg-[#043c53]"
                    >
                      Salvar Turma
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL */}
      {activeTab === 'AUDIT' && <AuditTable />}

      {/* TAB 4: SYSTEM SETTINGS & GUARD-RAILS */}
      {activeTab === 'SETTINGS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Parâmetros Globais & Guard-rails de Segurança</h3>
            <p className="text-xs text-slate-500">
              Controle dos limites de upload, regras de inspeção binária e políticas de guarda documental.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Limite de Payload por Arquivo</span>
                <span className="font-mono px-2 py-0.5 rounded bg-[#065373] text-white font-bold">10 MB</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Bloqueio estrito no gateway de rede para impedir sobrecarga de memória e ataques de negação de serviço.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Inspeção Rigorosa de Magic Bytes</span>
                <span className="font-mono px-2 py-0.5 rounded bg-emerald-600 text-white font-bold">ATIVO</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Assinaturas aceitas: %PDF- (0x25 0x50 0x44 0x46), JPEG (0xFF 0xD8 0xFF) e PNG (0x89 0x50 0x4E 0x47).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Tarjamento Automático de Dados Sensíveis</span>
                <span className="font-mono px-2 py-0.5 rounded bg-cyan-700 text-white font-bold">LGPD ART. 6º</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Aplica tarja opaca sobre filiação e endereço antes da visualização por operadores de validação.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Estrutura de Armazenamento Privado</span>
                <span className="font-mono px-2 py-0.5 rounded bg-slate-800 text-white font-bold">UUIDv4 HASH</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Nenhum arquivo é salvo com o nome original. Todos são armazenados sob identificador criptográfico.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
