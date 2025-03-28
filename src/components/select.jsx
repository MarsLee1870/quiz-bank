// src/components/ui/select.jsx

export function Select({ children, ...props }) {
    return <select {...props}>{children}</select>;
}

export function SelectTrigger({ children }) {
    return <div>{children}</div>;
}

export function SelectContent({ children }) {
    return <div>{children}</div>;
}

export function SelectItem({ children }) {
    return <div>{children}</div>;
}

export function SelectValue({ placeholder }) {
    return <span>{placeholder}</span>;
}
