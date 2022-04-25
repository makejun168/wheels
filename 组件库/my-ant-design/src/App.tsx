import React, {useState} from 'react';
import './App.css';
// import Hello from "./components/Hello";
import useMousePosition from "./hooks/useMousePosition";
import useURLLoader from "./hooks/useURLLoader";
import Button, {ButtonSize, ButtonType} from "./components/Button/button";

interface IShowResult {
  message: string;
  status: string;
}

// const DogShow: React.FC<{data: IShowResult}> = ({data}) => {
//   return (
//     <>
//       <h2>Dog show: {data.status}</h2>
//       <img src={data.message} />
//     </>
//   )
// }

const App: React.FC = () => {
  // const position = useMousePosition();
  // const [data, loading] = useURLLoader('https://dog.ceo/api/breeds/image/random', []);

  // const dogResult = data as IShowResult;

  const handleClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    console.log(e);
  }

  return (
    <div className="App">
      <header className="App-header">
        {/*{*/}
        {/*  !loading ? (*/}
        {/*    <>*/}
        {/*      <p>{dogResult.status}</p>*/}
        {/*      <img src={dogResult.message} alt=""/>*/}
        {/*    </>*/}
        {/*  ) : 'loading'*/}
        {/*}*/}
        {/*<p>X: {position.x}, Y: {position.y}</p>*/}
        {/*<LikeButton/>*/}
        {/*{*/}
        {/*  show && (<MouseTracker/>)*/}
        {/*}*/}
      </header>
      <Button className={'custom'} onClick={(e) => handleClick(e)} size={ButtonSize.Small} btnType={ButtonType.Primary}>点击</Button>
      <Button btnType={ButtonType.Danger}>点击</Button>
      <Button>点击</Button>
      <Button size={ButtonSize.Large} btnType={ButtonType.Link} disabled={true} href={'https://baidu.com'}>跳转到百度</Button>
    </div>
  );
}

export default App;
