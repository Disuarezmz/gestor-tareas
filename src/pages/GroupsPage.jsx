import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { useWF } from '../contexts/ThemeContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { wfTokens } from '../constants/tokens.js';
import { I } from '../constants/icons.js';
import { HW, Mono, SB, Btn, Ic, UserAvatar } from '../components/primitives/index.jsx';
import { PageTitle } from '../components/chrome/index.jsx';

const ROLE_LABEL = { owner: 'Propietario', member: 'Miembro' };

function GroupCard({ group, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 12px', cursor: 'pointer', borderRadius: 6,
        background: active ? wfTokens.surfaceHi : 'transparent',
        border: `1px solid ${active ? wfTokens.border : 'transparent'}`,
        display: 'flex', flexDirection: 'column', gap: 5,
        transition: 'background 0.1s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: wfTokens.surfaceHi, border: `1px solid ${wfTokens.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Ic d={I.users} size={13} />
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontSize: 11, color: wfTokens.text, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group.name}</div>
          <Mono size={9}>{group.memberCount} {group.memberCount === 1 ? 'miembro' : 'miembros'} · {ROLE_LABEL[group.myRole] || group.myRole}</Mono>
        </div>
      </div>
    </div>
  );
}

function MemberRow({ member, isOwner, onRemove, onToggleRole }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${wfTokens.borderSoft}` }}>
      <UserAvatar user={member} size={28} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: wfTokens.text }}>{member.name}</div>
        <Mono size={9}>{member.email}</Mono>
      </div>
      {isOwner ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <select
            value={member.role}
            onChange={(e) => onToggleRole(member.id, e.target.value)}
            style={{
              background: wfTokens.surfaceLo, border: `1px solid ${wfTokens.border}`,
              color: wfTokens.textMuted, fontSize: 9, borderRadius: 4, padding: '3px 6px',
              fontFamily: '"JetBrains Mono", monospace', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="owner">Propietario</option>
            <option value="member">Miembro</option>
          </select>
          <button
            onClick={() => onRemove(member.id)}
            title="Eliminar miembro"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, display: 'flex', opacity: 0.4, borderRadius: 3 }}
          >
            <Ic d={I.x} size={11} c={wfTokens.textMuted} />
          </button>
        </div>
      ) : (
        <Mono size={9} style={{ color: wfTokens.textDim }}>{ROLE_LABEL[member.role] || member.role}</Mono>
      )}
    </div>
  );
}

export default function GroupsPage() {
  const {
    groups, createGroup, updateGroup, deleteGroup,
    groupMembers, loadGroupMembers, addGroupMember, removeGroupMember,
  } = useApp();
  const { user } = useAuth();
  const { accent } = useWF();

  const [activeGroupId, setActiveGroupId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteError, setInviteError] = useState('');
  const [inviting, setInviting] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameEdit, setNameEdit] = useState('');

  const activeGroup = groups.find((g) => g.id === activeGroupId);
  const members = groupMembers[activeGroupId] || [];
  const isOwner = activeGroup?.myRole === 'owner';

  useEffect(() => {
    if (groups.length && !activeGroupId) setActiveGroupId(groups[0]?.id ?? null);
  }, [groups]);

  useEffect(() => {
    if (activeGroupId && !groupMembers[activeGroupId]) loadGroupMembers(activeGroupId);
    if (activeGroup) { setNameEdit(activeGroup.name); setEditingName(false); }
  }, [activeGroupId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const g = await createGroup({ name: newGroupName.trim(), desc: newGroupDesc.trim() });
    setActiveGroupId(g.id);
    setNewGroupName('');
    setNewGroupDesc('');
    setShowCreate(false);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteError('');
    setInviting(true);
    try {
      await addGroupMember(activeGroupId, { email: inviteEmail.trim(), role: inviteRole });
      setInviteEmail('');
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (userId) => {
    if (!confirm('¿Eliminar este miembro del equipo?')) return;
    try {
      await removeGroupMember(activeGroupId, userId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleRole = async (userId, role) => {
    try {
      await addGroupMember(activeGroupId, { email: members.find((m) => m.id === userId)?.email, role });
    } catch (err) {
      alert(err.message);
    }
  };

  const saveName = async () => {
    const trimmed = nameEdit.trim();
    if (trimmed && trimmed !== activeGroup.name) await updateGroup(activeGroupId, { name: trimmed });
    setEditingName(false);
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar el equipo "${activeGroup.name}"? Esta acción no se puede deshacer.`)) return;
    await deleteGroup(activeGroupId);
    setActiveGroupId(groups.find((g) => g.id !== activeGroupId)?.id ?? null);
  };

  const inputCss = {
    padding: '7px 10px', borderRadius: 5, border: `1px solid ${wfTokens.border}`,
    background: wfTokens.surfaceLo, color: wfTokens.text, fontSize: 11,
    fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageTitle
        sub={`${groups.length} ${groups.length === 1 ? 'equipo' : 'equipos'}`}
        right={
          <Btn primary onClick={() => setShowCreate(true)}>
            <Ic d={I.plus} size={10} /> Nuevo equipo
          </Btn>
        }
      >
        Equipos
      </PageTitle>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {/* ── Left: groups list ──────────────────────────── */}
        <div style={{
          width: 240, flexShrink: 0, borderRight: `1px solid ${wfTokens.borderSoft}`,
          background: wfTokens.surfaceLo, padding: '8px 10px',
          display: 'flex', flexDirection: 'column', gap: 4, overflow: 'auto',
        }}>
          {groups.length === 0 && (
            <div style={{ padding: '40px 12px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
              <Ic d={I.users} size={22} c={wfTokens.textDim} />
              <Mono size={10}>Sin equipos todavía</Mono>
            </div>
          )}
          {groups.map((g) => (
            <GroupCard key={g.id} group={g} active={g.id === activeGroupId} onClick={() => setActiveGroupId(g.id)} />
          ))}
          <div
            onClick={() => setShowCreate(true)}
            style={{
              padding: '9px 12px', cursor: 'pointer', borderRadius: 6, marginTop: 4,
              border: `1px dashed ${wfTokens.borderSoft}`, display: 'flex', alignItems: 'center', gap: 8,
              color: wfTokens.textDim,
            }}
          >
            <Ic d={I.plus} size={11} />
            <Mono>Nuevo equipo</Mono>
          </div>
        </div>

        {/* ── Right: group detail ────────────────────────── */}
        {activeGroup ? (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '16px 24px 14px', borderBottom: `1px solid ${wfTokens.borderSoft}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: wfTokens.surfaceHi, border: `1px solid ${wfTokens.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Ic d={I.users} size={16} c={wfTokens.textMuted} />
                </div>
                <div style={{ flex: 1 }}>
                  {editingName && isOwner ? (
                    <input
                      autoFocus
                      value={nameEdit}
                      onChange={(e) => setNameEdit(e.target.value)}
                      onBlur={saveName}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setNameEdit(activeGroup.name); setEditingName(false); } }}
                      style={{
                        fontSize: 20, fontFamily: '"Caveat", cursive', fontWeight: 700,
                        background: 'transparent', border: 'none', borderBottom: `2px solid ${accent}`,
                        outline: 'none', color: wfTokens.text, padding: '0 2px',
                      }}
                    />
                  ) : (
                    <HW size={20} style={{ cursor: isOwner ? 'text' : 'default' }} onClick={() => isOwner && setEditingName(true)}>
                      {activeGroup.name}
                    </HW>
                  )}
                  <Mono size={9} style={{ display: 'block', marginTop: 2 }}>
                    {members.length} {members.length === 1 ? 'miembro' : 'miembros'} · {ROLE_LABEL[activeGroup.myRole] || activeGroup.myRole}
                  </Mono>
                </div>
                {isOwner && (
                  <button
                    onClick={handleDelete}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', borderRadius: 4, color: 'oklch(65% 0.18 25)' }}
                    title="Eliminar equipo"
                  >
                    <Ic d={I.ban} size={13} c="oklch(65% 0.18 25)" />
                  </button>
                )}
              </div>
            </div>

            {/* Members */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
              <Mono size={9} style={{ display: 'block', marginBottom: 12 }}>MIEMBROS</Mono>

              {members.map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  isOwner={isOwner && m.id !== user?.id}
                  onRemove={handleRemove}
                  onToggleRole={handleToggleRole}
                />
              ))}

              {/* Invite form */}
              {isOwner && (
                <form onSubmit={handleInvite} style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Mono size={9}>INVITAR MIEMBRO</Mono>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => { setInviteEmail(e.target.value); setInviteError(''); }}
                      placeholder="email@ejemplo.com"
                      style={{ ...inputCss, flex: 1 }}
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      style={{ ...inputCss, width: 120 }}
                    >
                      <option value="member">Miembro</option>
                      <option value="owner">Propietario</option>
                    </select>
                    <button
                      type="submit"
                      disabled={inviting || !inviteEmail.trim()}
                      style={{
                        padding: '7px 16px', borderRadius: 5, border: 'none', cursor: 'pointer',
                        background: accent, color: '#0e0e14', fontSize: 11, fontFamily: 'inherit', fontWeight: 600,
                        opacity: inviting || !inviteEmail.trim() ? 0.5 : 1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {inviting ? '…' : 'Añadir'}
                    </button>
                  </div>
                  {inviteError && <Mono size={9} style={{ color: 'oklch(65% 0.18 25)' }}>{inviteError}</Mono>}
                </form>
              )}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14 }}>
            <Ic d={I.users} size={28} c={wfTokens.textDim} />
            <Mono size={11}>Crea o selecciona un equipo</Mono>
          </div>
        )}
      </div>

      {/* Create group modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)' }}>
          <form onSubmit={handleCreate} style={{ width: 400, background: wfTokens.surface, border: `1px solid ${wfTokens.border}`, borderRadius: 10, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${wfTokens.borderSoft}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <HW size={18}>Nuevo equipo</HW>
              <div style={{ flex: 1 }} />
              <button type="button" onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4, borderRadius: 4 }}>
                <Ic d={I.x} size={14} c={wfTokens.textMuted} />
              </button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <Mono size={9} style={{ display: 'block', marginBottom: 6 }}>NOMBRE DEL EQUIPO</Mono>
                <input
                  autoFocus
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Diseño, Backend, Marketing…"
                  style={inputCss}
                />
              </div>
              <div>
                <Mono size={9} style={{ display: 'block', marginBottom: 6 }}>DESCRIPCIÓN (OPCIONAL)</Mono>
                <input
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Propósito de este equipo…"
                  style={inputCss}
                />
              </div>
            </div>
            <div style={{ padding: '14px 20px', borderTop: `1px solid ${wfTokens.borderSoft}`, display: 'flex', gap: 8, justifyContent: 'flex-end', background: wfTokens.surfaceLo }}>
              <button type="button" onClick={() => setShowCreate(false)} style={{ padding: '7px 14px', borderRadius: 5, background: 'transparent', color: wfTokens.textMuted, border: `1px solid ${wfTokens.border}`, cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>
                Cancelar
              </button>
              <button type="submit" disabled={!newGroupName.trim()} style={{ padding: '7px 20px', borderRadius: 5, background: newGroupName.trim() ? accent : wfTokens.border, color: '#0e0e14', border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', fontWeight: 600 }}>
                Crear equipo
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
