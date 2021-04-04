import React from 'react';
import ReactDOM from 'react-dom';
let style = {color:'green',border:'1px solid red',margin:'5px'}
let virtualDOM = (
    <div key="A" style={style}>A
        <div key="B1"  style={style}>B1</div>
        <div key="B2"  style={style}>B2</div>
    </div>
)
ReactDOM.render(virtualDOM,document.getElementById('root'))