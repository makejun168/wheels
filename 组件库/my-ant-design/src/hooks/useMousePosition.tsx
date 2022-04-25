import React, { useEffect, useState } from "react";

const useMousePosition: () => { x: number; y: number } = () => {
    const [position, setPosition] = useState({x: 0, y: 0});

    useEffect(() => {
        console.log('beforeEffect', position.x)
        const updateMouse = (e: MouseEvent) => {
            console.log('inner');
            setPosition({x: e.clientX, y: e.clientY})
        }
        document.addEventListener('mousemove', updateMouse);
        return () => {
            console.log('remove Effect', position.x);
            document.removeEventListener('mousemove', updateMouse);
        }
    })

    return position;
}

export default useMousePosition;
