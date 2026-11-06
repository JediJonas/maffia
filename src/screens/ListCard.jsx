// @ts-check

/**
 * En lista i ram med berättarens ruta ovanför och en lapp som hänger över
 * nedre kanten, som i skisserna. Lappen säger hur långt det har kommit.
 * @param {object} props
 * @param {string} props.lead Rutan ovanför listan.
 * @param {string | null} [props.tag] Lappen nere till höger.
 * @param {import('react').ReactNode} props.children Listan.
 */
export function ListCard({ lead, tag = null, children }) {
  return (
    <div className={tag ? 'list-card list-card-tagged' : 'list-card'}>
      <p className="list-lead">{lead}</p>
      <div className="list-frame">
        {children}
        {tag && <p className="list-tag" aria-live="polite">{tag}</p>}
      </div>
    </div>
  );
}
