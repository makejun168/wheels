import React, {useEffect, useState} from "react";

const LikeButton: React.FC = () => {
    const [obj, setObj] = useState({like: 0, on: true});
    useEffect(() => {
        document.title = `点击了 ${obj.like} 次`
    })
    return (
        <>
            <button onClick={() => {setObj(prev => ({like: prev.like + 1, on: prev.on}))}}>{obj.like}👍</button>
            <button onClick={() => {setObj(prev => ({like: prev.like, on: !prev.on}))}}>开关{obj.on}</button>
        </>
    )
}

export default LikeButton;
