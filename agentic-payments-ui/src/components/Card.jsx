const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-[#e2d5c4] shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

export default Card;
