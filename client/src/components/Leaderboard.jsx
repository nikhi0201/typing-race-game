import React, { useEffect, useState } from 'react'
import { socket } from '../socket'


export default function Leaderboard(){
const [list, setList] = useState([])
useEffect(()=>{
socket.emit('getLeaderboard')
socket.on('leaderboard', (l)=> setList(l))
return ()=> socket.off('leaderboard')
},[])
return (
<div className="leaderboard">
<h3>Leaderboard</h3>
<ol>
{list.map(r => <li key={r.id}>{r.name} — {r.wpm} WPM ({r.accuracy}%)</li>)}
</ol>
</div>
)
}