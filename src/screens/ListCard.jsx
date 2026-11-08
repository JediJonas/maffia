// @ts-check

/**
 * En lista i ram med berättarens ruta i övre vänstra hörnet och en lapp som
 * hänger över nedre kanten, som i skisserna. Lappen säger hur långt det har kommit.
 * @param {object} props
 * @param {string} props.lead Rutan uppe till vänster.
 * @param {string | null} [props.tag] Lappen nere till höger.
 * @param {boolean} [props.isTagCounting] Lappen räknar, t.ex. "Tre av fem har röstat". Då har den en fast minsta bredd, så att den inte ändrar bredd när talet byts.
 * @param {import('react').ReactNode} props.children Listan.
 */
export function ListCard({ lead, tag = null, isTagCounting = false, children }) {
  return (
    <div className={tag ? 'list-card list-card-tagged' : 'list-card'}>
      <p className="list-lead">{lead}</p>
      <div className="list-frame">
        {children}
        {tag && <p className={isTagCounting ? 'list-tag list-tag-counting' : 'list-tag'} aria-live="polite">{tag}</p>}
      </div>
    </div>
  );
}
