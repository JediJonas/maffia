// @ts-check
import { ListCard } from './ListCard.jsx';
import { TEAM_RULES, listRoleRules, listRoundRules } from './rulesText.js';

/**
 * Reglerna i en egen vy, som Din figur, så att alla kan läsa dem medan de
 * väntar i lobbyn. Rollerna följer värdens inställningar.
 * @param {object} props
 * @param {import('../game/settings.js').GameSettings} props.settings
 * @param {number} props.playerCount
 * @param {() => void} props.onClose
 */
export function RulesView({ settings, playerCount, onClose }) {
  return (
    <section className="screen" aria-labelledby="phase-title">
      <div className="screen-content">
        <RuleList lead="Staden har två lag." rows={TEAM_RULES} />
        <RuleList lead="De här rollerna finns i staden." rows={listRoleRules(settings, playerCount)} />
        <RuleList lead="Natt och dag växlar tills ett lag har vunnit." rows={listRoundRules(settings)} />
        <p className="explanation">Den som är ute ur spelet får se på, men inte prata eller rösta.</p>
      </div>
      <div className="bottom-actions">
        <button type="button" className="primary" onClick={onClose}>Klar</button>
      </div>
    </section>
  );
}

/**
 * @param {{ lead: string, rows: import('./rulesText.js').RuleRow[] }} props
 */
function RuleList({ lead, rows }) {
  return (
    <ListCard lead={lead}>
      <dl className="rules-list">
        {rows.map((row) => (
          <div key={row.title}>
            <dt>{row.title}</dt>
            <dd>{row.text}</dd>
          </div>
        ))}
      </dl>
    </ListCard>
  );
}
