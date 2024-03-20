import { useState } from 'react';

export default function Drawer({
  label,
  defaultOpen = false,
  children,
  ...props
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button onClick={() => setOpen((prev) => !prev)}>{label}</button>
      {open && <div>{children}</div>}
    </div>
  );
}
