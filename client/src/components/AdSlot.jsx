export default function AdSlot({ slotName = "ad-slot" }) {
  return (
    <div className="ad-slot" aria-label="Advertisement">
      <div className="ad-placeholder">
        {/* Insert AdSense script and ins element when approved */}
        <span>Ad Space: {slotName}</span>
      </div>
    </div>
  )
}
