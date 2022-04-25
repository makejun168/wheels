import React, { useEffect, useState } from "react";

const MouseTracker: React.FC = () => {
    const [position, setPosition] = useState({x: 0, y: 0});

    useEffect(() => {
        console.log('beforeEffect', position.x)
        const updateMouse = (e: MouseEvent) => {
            console.log('inner');
            setPosition({x: e.clientX, y: e.clientY})
        }
        document.addEventListener('click', updateMouse);
        return () => {
            console.log('afterEffect', position.x);
            document.removeEventListener('click', updateMouse);
        }
    })

    console.log('beforeRender', position.x); // render 之前

    return (
        <p>X: {position.x}, Y: {position.y}</p>
    )
}

export default MouseTracker
