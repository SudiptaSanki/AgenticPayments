const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-[#f3e8d6] text-[#92400e]',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-orange-100 text-orange-800',
    verified: 'bg-[#fef3c7] text-[#b45309] border border-[#fde68a]'
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

export default Badge;
