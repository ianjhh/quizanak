import { useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import './Snake.css';
import useInterval from './useInterval.tsx';
import React from 'react'
const snake_eat = require('./snake_eat.wav');
const snake_die = require('./snake_die.wav');
const appleLogo = require('./applePixels.png');

const canvasX = 420;
const canvasY = 420;
const initialSnake = [[4,4],[4,4]]
const initialApple = [6,6];
const Scale =30;
const timeDelay = 100;

function Snake() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [snake,setSnake] = useState(initialSnake); 
  const [apple,setApple] = useState(initialApple); 
  const [direaction,setDireaction] = useState([0,-1]);
  const [delay,setDelay] = useState<number | null>(null)
  const [gameover,SetGameover] = useState(false)
  const [score,setScore] = useState(0);
  let eat_audio = new Audio(snake_eat);
  let die_audio = new Audio(snake_die);

  useInterval(()=> runGame(),delay)
  
  useEffect(()=>{
    let fruit = document.getElementById("fruit") as HTMLCanvasElement
    if(canvasRef.current){
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if(ctx){
        ctx.setTransform(Scale, 0, 0, Scale,0,0)
        ctx.clearRect(0,0,window.innerWidth,window.innerHeight)
        ctx.fillStyle = "#a3d001";
        snake.forEach(([x,y])=> ctx.fillRect(x,y,1,1))
        ctx.drawImage(fruit,apple[0],apple[1],1,1)
      }
    }
  },[snake,apple,gameover])
 
  function handleSetScore(){
    if(score>Number(localStorage.getItem("snakeScore"))){
      localStorage.setItem("snakeScore",JSON.stringify(score))
    }
  }

  function Play(){
    setSnake(initialSnake)
    setApple(initialApple)
    setDireaction([1,0])
    setDelay(timeDelay)
    setScore(0)
    SetGameover(false)
  }

  function checkCollision(head:number[]){
    for(let i=0;i<head.length;i++){
      if(head[i]<0 || head[i] * Scale >= canvasX) {die_audio.play(); return true;}
    }
    for(const s of snake){
      if(head[0] === s[0] && head[1]===s[1]) {die_audio.play(); return true;}
    }
    return false;
  }

  function appleAte(newSnake:number[][]){
    let coord = apple.map(()=> Math.floor(Math.random()*canvasX/Scale))
    if(newSnake[0][0]=== apple[0] && newSnake[0][1] === apple[1]){
      let newApple = coord;
      setScore(score+1);
      setApple(newApple)
      eat_audio.play()
      return true
    }
    return false;
  }

  const runGame = () =>{
    const newSnake = [...snake];
    const newSnakeHead = [newSnake[0][0] + direaction[0], newSnake[0][1] + direaction[1]];
    newSnake.unshift(newSnakeHead);
    if(checkCollision(newSnakeHead)){
      setDelay(null)
      SetGameover(true);
      handleSetScore()
    }
    if(!appleAte(newSnake)){
      newSnake.pop()
    }
    setSnake(newSnake);
  }

  function changeDirection(e:React.KeyboardEvent<HTMLDivElement>){
    switch(e.key){
      case "ArrowLeft":
        setDireaction([-1,0])
        break;
      case "ArrowRight":
        setDireaction([1,0])
        break;
      case "ArrowUp":
        setDireaction([0,-1])
        break;
      case "ArrowDown":
        setDireaction([0,1])
        break;
    }
  }

  return (
    <div onKeyDown={(e)=> changeDirection(e)}>
     <Button type='button' onClick={Play} className="playButton mb-1">Play</Button>
     <img id="fruit" src={appleLogo} alt="Fruit" width="0" />
     {!gameover? <p className='mb-2'>Score: {score}</p> : <p className='gameOver mb-2'>Game Over! Your score is {score}</p>}
     <canvas className='playArea bg-black' ref={canvasRef} width={`${canvasX}px`} height={`${canvasY}px`}/>
    </div>
  );
}

export default Snake;