import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useWF } from '../../contexts/ThemeContext.jsx';
import { wfTokens } from '../../constants/tokens.js';
import { I } from '../../constants/icons.js';
import { HW, Mono, Ic, UserAvatar } from '../primitives/index.jsx';

const ROLE_LABEL = { owner: 'Propietario', editor: 'Editor', viewer: 'Lector' };
const ROLE_DESC = { editor: 'Puede crear y editar tareas', viewer: 'Solo puede ver el proyecto' };

function MemberRow({ member, canManage, onRemove, onChangeRole }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: `1px solid ${wfTokens.borderSoft}` }}>
      <UserAvatar user={member} size={30} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: wfTokens.text }}>{member.name}</div>
        <Mono size={9}>{member.email}</Mono>
      </div>
      {canManage && member.role !== 'owner' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <select
            value={member.role}
            onChange={(e) => onChangeRole(member.id, e.target.value)}
            style={{
              background: wfTokens.surfaceLo, border: `1px solid ${wfTokens.border}`,
              color: wfTokens.textMuted, fontSize: 9, borderRadius: 4, padding: '3px 6px',
              fontFamily: '"JetBrains Mono", monospace', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="editor">Editor</option>
            <option value="viewer">Lector</option>
          </select>
          <button
            onClick={() => onRemove(member.id, member.name)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, display: 'flex', opacity: 0.4, borderRadius: 3 }}
          >
            <Ic d={I.x} size={11} c={wfTokens.textMuted} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            padding: '2px 8px', borderRadius: 999, fontSize: 9,
            fontFamily: '"JetBrains Mono", monospace',
            background: member.role === 'owner' ? `color-mix(in oklch, var(--wf-accent) 14%, transparent)` : wfTokens.surfaceHi,
            color: member.role === 'owner' ? 'var(--wf-accent)' : wfTokens.textDim,
            border: `1px solid ${member.role === 'owner' ? 'var(--wf-accent)' : wfTokens.border}40`,
          }}>
            {ROLE_LABEL[member.role] || member.role}
          </span>
          {canManage && member.role === 'owner' && (
            <Mono size={9} style={{ color: wfTokens.textDim }}>(tú)</Mono>
          )}
        </div>
      )}
    </div>
  );
}

export default function ShareProjectModal({ projectId, onClose }) {
  const { projectMembers, loadProjectMembers, addProjectMember, updateProjectMember, removeProjectMember, groups, loadGroupMembers } = useApp();
  const { user } = useAuth();
  const { accent } = useWF();

  const [tab, setTab] = useState('email');
  const [email, setEmail] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [role, setRole] = useState('viewer');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  const members = projectMembers[projectId] || [];
  const myRole = members.find((m) => m.id === user?.id)?.role;
  const canManage = myRole === 'owner';

  useEffect(() => {
    loadProjectMembers(projectId);
  }, [projectId]);

  useEffect(() => {
    // Pre-load groups list (for the "por equipo" tab)
    groups.forEach((g) => { if (!g._membersLoaded) loadGroupMembers(g.id); });
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setAdding(true);
    try {
      if (tab === 'email') {
        if (!email.trim()) return;
        await addProjectMember(projectId, { email: email.trim(), role });
        setEmail('');
      } else {
        if (!selectedGroup) return;
        const result = await addProjectMember(projectId, { groupId: parseInt(selectedGroup), role });
        setSelectedGroup('');
        if (result?.added === 0) setError('Todos los miembros del equipo ya tienen acceso');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await updateProjectMember(projectId, userId, newRole);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemove = async (userId, name) => {
    if (!confirm(`¿Quitar a "${name}" del proyecto?`)) return;
    try {
      await removeProjectMember(projectId, userId);
    } catch (err) {
      alert(err.message);
    }
  };

  const inputCss = {
    padding: '8px 10px', borderRadius: 5, border: `1px solid ${wfTokens.border}`,
    background: wfTokens.surfaceLo, color: wfTokens.text, fontSize: 11,
    fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)' }}>
      <div style={{
        width: 520, maxHeight: '85vh', background: wfTokens.surface,
        border: `1px solid ${wfTokens.border}`, borderRadius: 10,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${wfTokens.borderSoft}`, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <Ic d={I.share} size={14} c={wfTokens.textMuted} />
          <HW size={18}>Compartir proyecto</HW>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4, borderRadius: 4 }}>
            <Ic d={I.x} size={14} c={wfTokens.textMuted} />
          </button>
        </div>

        {/* Members list */}
        <div style={{ flex: 1, overflow: 'auto', padding: '14px 20px' }}>
          <Mono size={9} style={{ display: 'block', marginBottom: 8 }}>MIEMBROS CON ACCESO · {members.length}</Mono>
          {members.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              canManage={canManage}
              onChangeRole={handleChangeRole}
              onRemove={handleRemove}
            />
          ))}
        </div>

        {/* Add member section — only owners */}
        {canManage && (
          <div style={{ padding: '14px 20px', borderTop: `1px solid ${wfTokens.borderSoft}`, background: wfTokens.surfaceLo, flexShrink: 0 }}>
            <Mono size={9} style={{ display: 'block', marginBottom: 10 }}>AÑADIR ACCESO</Mono>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
              {[['email', 'Por email'], ['group', 'Por equipo']].map(([k, label]) => (
                <button
                  key={k} onClick={() => { setTab(k); setError(''); }}
                  style={{
                    padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
                    fontSize: 10, fontFamily: '"JetBrains Mono", monospace',
                    background: tab === k ? wfTokens.surfaceHi : 'transparent',
                    color: tab === k ? wfTokens.text : wfTokens.textDim,
                    borderBottom: tab === k ? `2px solid ${accent}` : '2px solid transparent',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {tab === 'email' ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="email@ejemplo.com"
                    style={{ ...inputCss, flex: 1 }}
                  />
                ) : (
                  <select
                    value={selectedGroup}
                    onChange={(e) => { setSelectedGroup(e.target.value); setError(''); }}
                    style={{ ...inputCss, flex: 1, cursor: 'pointer', colorScheme: 'dark' }}
                  >
                    <option value="">Seleccionar equipo…</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name} ({g.memberCount} miembros)</option>
                    ))}
                  </select>
                )}

                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ ...inputCss, width: 110, colorScheme: 'dark' }}
                >
                  <option value="viewer">Lector</option>
                  <option value="editor">Editor</option>
                </select>

                <button
                  type="submit"
                  disabled={adding || (tab === 'email' ? !email.trim() : !selectedGroup)}
                  style={{
                    padding: '8px 16px', borderRadius: 5, border: 'none', cursor: 'pointer',
                    background: accent, color: '#0e0e14', fontSize: 11, fontFamily: 'inherit', fontWeight: 600,
                    opacity: adding || (tab === 'email' ? !email.trim() : !selectedGroup) ? 0.5 : 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {adding ? '…' : 'Añadir'}
                </button>
              </div>

              {role && (
                <Mono size={9} style={{ color: wfTokens.textDim }}>{ROLE_DESC[role]}</Mono>
              )}
              {error && <Mono size={9} style={{ color: 'oklch(65% 0.18 25)' }}>{error}</Mono>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
