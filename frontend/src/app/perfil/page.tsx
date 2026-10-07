'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  Camera,
  Trash2,
  User,
  Mail,
  Phone,
  CreditCard,
  Lock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Building,
  GraduationCap,
  ArrowLeft,
  Sparkles,
  Save,
  KeyRound,
  IdCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PerfilPage() {
  const {
    currentRole,
    currentUserProfile,
    updateCurrentUserProfile,
    updateCurrentUserPassword,
    student,
    activeInstitution,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'dados' | 'seguranca'>('dados');

  // Form states - Dados Pessoais
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>('');
  const [cargo, setCargo] = useState('');

  // Form states - Segurança
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial state
  useEffect(() => {
    setNome(currentUserProfile.nome || '');
    setEmail(currentUserProfile.email || '');
    setTelefone(currentUserProfile.telefone || '');
    setCpf(currentUserProfile.cpf || '');
    setAvatarUrl(currentUserProfile.avatarUrl || '');
    setCargo(currentUserProfile.cargo || '');
  }, [currentUserProfile]);

  // Mask helpers
  const formatPhone = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    if (raw.length <= 10) {
      return raw.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    }
    return raw.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
  };

  const formatCPF = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    return raw
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  // Avatar upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem selecionada deve ter no máximo 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatarUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Initials generator
  const initials = (nome || 'DocFlow')
    .replace(/^(Profª\.|Prof\.|Dr\.|Dra\.)\s*/, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  // Save profile changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert('O nome completo é obrigatório.');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      updateCurrentUserProfile({
        nome,
        email,
        telefone,
        cpf,
        avatarUrl,
        cargo,
      });
      setIsSaving(false);
    }, 400);
  };

  // Save password changes
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Informe sua senha atual para validação.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve possuir no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('A confirmação da nova senha não confere.');
      return;
    }

    setIsSaving(true);
    const success = await updateCurrentUserPassword(currentPassword, newPassword);
    setIsSaving(false);

    if (success) {
      setPasswordSuccess('Senha redefinida com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const defaultBackUrl =
    currentRole === 'ESTUDANTE'
      ? '/estudante'
      : currentRole === 'COORDENADOR'
      ? '/coordenador'
      : '/admin';

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-6xl mx-auto">
      {/* CABEÇALHO DA PÁGINA COM NAVEGAÇÃO DE VOLTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <Link
            href={defaultBackUrl}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0284c7] hover:text-sky-600 dark:text-[#00b4d8] mb-1 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Voltar ao Painel Principal</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-[#065373] dark:text-cyan-300 tracking-tight flex items-center gap-2">
            <IdCard className="w-6 h-6 text-[#0284c7] dark:text-[#00b4d8]" />
            <span>Meu Perfil & Configurações</span>
          </h1>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-sky-50 dark:bg-[#122634] border border-sky-200 dark:border-[#1c3547] text-xs font-semibold text-[#065373] dark:text-cyan-300 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>
            {currentRole === 'ESTUDANTE'
              ? 'Ambiente do Aluno'
              : currentRole === 'COORDENADOR'
              ? 'Ambiente da Coordenação'
              : 'Super Administrador'}
          </span>
        </div>
      </div>

      {/* GRID PRINCIPAL: RESUMO DO PERFIL À ESQUERDA + FORMULÁRIO À DIREITA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUNA ESQUERDA: CARD VISUAL DE FOTO E IDENTIFICAÇÃO (4 colunas) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 text-center space-y-5">
          {/* Avatar com moldura e botão de câmera */}
          <div className="relative inline-block mx-auto group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gradient-to-br from-[#065373] via-[#0284c7] to-[#00b4d8] border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center text-white font-black text-3xl mx-auto relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="tracking-wider">{initials}</span>
              )}
            </div>

            {/* Botão de câmera sobre o avatar */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 p-2.5 rounded-full bg-[#0284c7] hover:bg-sky-600 text-white shadow-lg border-2 border-white dark:border-slate-900 transition-all hover:scale-110 cursor-pointer"
              title="Trocar foto de perfil"
              aria-label="Trocar foto de perfil"
            >
              <Camera className="w-4 h-4" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900 dark:text-white truncate">
              {nome || 'Sem Nome'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {email || 'usuario@docflow.edu.br'}
            </p>
            <span className="inline-block mt-1 px-3 py-1 rounded-full text-[11px] font-bold bg-sky-100 dark:bg-sky-950/60 text-[#0284c7] dark:text-sky-300">
              {currentRole === 'ESTUDANTE'
                ? student.tipoVinculo === 'APRENDIZ'
                  ? 'Jovem Aprendiz'
                  : 'Estagiário'
                : cargo || (currentRole === 'COORDENADOR' ? 'Coordenador Acadêmico' : 'Super Administrador')}
            </span>
          </div>

          {/* Botões de Ação para a Foto */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 text-[#0284c7]" />
              <span>Alterar Foto de Perfil</span>
            </button>

            {avatarUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remover Foto Atual</span>
              </button>
            )}
          </div>

          {/* Detalhes Institucionais / Organizacionais */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 text-left space-y-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Vínculo Registrado
            </span>

            {currentRole === 'ESTUDANTE' ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <GraduationCap className="w-4 h-4 text-[#0284c7] shrink-0" />
                  <span className="truncate">{student.curso}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Building className="w-4 h-4 text-[#0284c7] shrink-0" />
                  <span className="truncate">{student.empresa}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Matrícula:</span>
                  <span className="font-mono font-bold text-[#0284c7]">{student.matricula}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Building className="w-4 h-4 text-[#0284c7] shrink-0" />
                  <span className="truncate">
                    {currentRole === 'COORDENADOR' ? activeInstitution : 'Escopo Global Multi-Instituição'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: FORMULÁRIO COM ABAS (8 colunas) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          {/* Navegação por Abas */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 px-6">
            <button
              type="button"
              onClick={() => setActiveTab('dados')}
              className={cn(
                'flex items-center gap-2 py-4 px-4 text-xs font-extrabold border-b-2 transition-all cursor-pointer',
                activeTab === 'dados'
                  ? 'border-[#0284c7] text-[#0284c7] dark:text-[#00b4d8] bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              <User className="w-4 h-4" />
              <span>Dados Pessoais & Cadastrais</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('seguranca')}
              className={cn(
                'flex items-center gap-2 py-4 px-4 text-xs font-extrabold border-b-2 transition-all cursor-pointer',
                activeTab === 'seguranca'
                  ? 'border-[#0284c7] text-[#0284c7] dark:text-[#00b4d8] bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              <KeyRound className="w-4 h-4" />
              <span>Segurança & Senha</span>
            </button>
          </div>

          {/* Conteúdo da Aba */}
          <div className="p-6 sm:p-8 flex-1">
            {activeTab === 'dados' ? (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Nome Completo */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#0284c7]" />
                      <span>Nome Completo *</span>
                    </label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full px-4 py-3 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all font-medium"
                      required
                    />
                  </div>

                  {/* E-mail */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#0284c7]" />
                      <span>E-mail Corporativo / Institucional *</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@dominio.com"
                      className="w-full px-4 py-3 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all font-medium"
                      required
                    />
                  </div>

                  {/* Telefone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#0284c7]" />
                      <span>Telefone / WhatsApp</span>
                    </label>
                    <input
                      type="text"
                      value={telefone}
                      onChange={(e) => setTelefone(formatPhone(e.target.value))}
                      placeholder="(11) 98765-4321"
                      maxLength={15}
                      className="w-full px-4 py-3 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all font-medium"
                    />
                  </div>

                  {/* CPF */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#0284c7]" />
                      <span>CPF (Conformidade LGPD)</span>
                    </label>
                    <input
                      type="text"
                      value={cpf}
                      onChange={(e) => setCpf(formatCPF(e.target.value))}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="w-full px-4 py-3 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all font-medium"
                    />
                  </div>

                  {/* Cargo / Função */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
                      <span>Cargo / Atribuição Cadastral</span>
                    </label>
                    <input
                      type="text"
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                      placeholder={
                        currentRole === 'ESTUDANTE'
                          ? 'Jovem Aprendiz'
                          : 'Coordenador Acadêmico / RH'
                      }
                      className="w-full px-4 py-3 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Botão de Salvar Alterações */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#0284c7] to-[#00b4d8] hover:from-sky-600 hover:to-sky-500 text-white text-xs font-extrabold shadow-lg shadow-[#0284c7]/25 hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Salvando Alterações...' : 'Salvar Alterações do Perfil'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* ABA DE SEGURANÇA E SENHA */
              <form onSubmit={handleSavePassword} className="space-y-5">
                <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-[#102230] border border-sky-100 dark:border-[#1c3547] text-slate-700 dark:text-slate-300 text-xs flex items-start gap-3">
                  <Lock className="w-5 h-5 shrink-0 text-[#0284c7] mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                      Política de Senha Forte
                    </span>
                    Para redefinir sua credencial de acesso, digite sua senha atual para confirmação e informe uma nova combinação de no mínimo 6 dígitos.
                  </div>
                </div>

                {passwordError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                {/* Senha Atual */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Senha Atual *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Digite sua senha atual de acesso"
                      className="w-full px-4 py-3 pr-10 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#0284c7]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Nova Senha */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Nova Senha *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nova senha (mínimo 6 caracteres)"
                      className="w-full px-4 py-3 pr-10 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#0284c7]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmar Nova Senha */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Confirmar Nova Senha *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova combinação de senha"
                      className="w-full px-4 py-3 pr-10 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#0284c7]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Indicador de equivalência */}
                {newPassword && confirmPassword && (
                  <div className="text-[11px] font-bold flex items-center gap-1.5 pt-1">
                    {newPassword === confirmPassword ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        As combinações conferem perfeitamente.
                      </span>
                    ) : (
                      <span className="text-rose-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        A confirmação da senha não é igual à nova senha digitada.
                      </span>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#0284c7] to-[#00b4d8] hover:from-sky-600 hover:to-sky-500 text-white text-xs font-extrabold shadow-lg shadow-[#0284c7]/25 hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isSaving ? 'Atualizando...' : 'Atualizar Minha Senha'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
