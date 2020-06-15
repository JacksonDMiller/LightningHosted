import React from 'react'
import { Switch, Route, useParams } from 'react-router-dom'


export default function Share(props) {
    let { image } = useParams();
    console.log(image)
    return (
        <div>
            hello
        </div>
    )
}
