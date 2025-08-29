import React, { useEffect, useRef, useState } from 'react'
const passage = room?.passage || ''
const startRef = useRef(null)


useEffect(()=>{
socket.on('raceState', (r)=> setState(r))
socket.on('runnerFinished', ()=>{})
socket.on('raceStarted', (r)=>{ setState(r); startRef.current = Date.now(); })
return ()=>{ socket.off('raceState'); socket.off('raceStarted') }
},[])


useEffect(()=>{
// send progress periodically
const t = setInterval(()=>{
if (!room?.started) return
socket.emit('progress',{ roomId: room.id, pos, correctChars: correct, totalChars: total })
}, 500)
return ()=> clearInterval(t)
},[pos, correct, total, room])


function onChange(e){
const val = e.target.value
setInput(val)
let c = 0
for (let i=0;i<val.length;i++) if (val[i]===passage[i]) c++
setCorrect(c)
setTotal(val.length)
setPos(Math.min(val.length, passage.length))
// finished
if (val.length >= passage.length){
const elapsedMin = Math.max((Date.now()-startRef.current)/60000, 0.0001)
const wpm = Math.round((total/5)/elapsedMin)
const accuracy = Math.round((correct/total)*100)
// build simple events: timestamps every 100ms for demo
const events = []
socket.emit('finish', { roomId: room.id, name: you.name, wpm, accuracy, events, passage })
}
}


return (
<div className="race">
<div className="passage">{passage}</div>
<textarea value={input} onChange={onChange} placeholder="Start typing when race starts..." />


<div className="status">
<div>You: {you.name}</div>
<div>Progress: {pos}/{passage.length}</div>
<div>Accuracy: {total? Math.round((correct/total)*100) : 100}%</div>
</div>


<div className="opponents">
<h4>Opponents</h4>
<ul>
{state.players.filter(p=>p.id!==you.id).map(p=> (
<li key={p.id}>{p.name} — {p.wpm} WPM — {p.progress}/{passage.length}</li>
))}
{state.ghostRun && <li>Ghost — {state.ghostRun.wpm} WPM</li>}
</ul>
</div>
</div>
)
}