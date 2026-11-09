// @ts-check

/**
 * En lista i ram med berättarens ruta i övre vänstra hörnet och en lapp som
 * hänger över nedre kanten, som i skisserna. Lappen säger hur långt det har kommit.
 * @param {object} props
 * @param {string} props.lead Rutan uppe till vänster.
 * @param {string | null} [props.tag] Lappen nere till höger.
 * @param {readonly string[]} [props.tagChoices] Alla uppräkningar lappen kan visa i den här listan, t.ex. "En av fem har röstat" till "Fem av fem har röstat". Medan lappen visar en av dem blir den lika bred som den längsta, så att den inte ändrar bredd när talet byts. Andra texter, som "Ingen har röstat", får den bredd de behöver.
 * @param {boolean} [props.isLeadAbove] Rutan står ovanför listan i stället för i hörnet, som i inställningarna och reglerna.
 * @param {import('react').ReactNode} props.children Listan.
 */
export function ListCard({ lead, tag = null, tagChoices = [], isLeadAbove = false, children }) {
  const isCounting = tag !== null && tagChoices.includes(tag);
  const className = ['list-card', tag && 'list-card-tagged', isLeadAbove && 'list-card-lead-above'].filter(Boolean).join(' ');
  return (
    <div className={className}>
      <p className="list-lead">{lead}</p>
      <div className="list-frame">
        {children}
        {tag && (
          <p className={isCounting ? 'list-tag list-tag-counting' : 'list-tag'}>
            {isCounting && tagChoices.map((choice) => <span key={choice} className="list-tag-sizer" aria-hidden="true">{choice}</span>)}
            <span aria-live="polite">{tag}</span>
          </p>
        )}
      </div>
    </div>
  );
}
