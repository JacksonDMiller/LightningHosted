import React, { useState, useRef } from 'react';
import ReactAvatarEditor from 'react-avatar-editor'
export default function AvatarUploader(props) {


    const [image, setImage] = useState('/api/avatar/Default.jpg');
    const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
    const [scale, setScale] = useState(1);

    const editor = useRef(editor)

    const handleNewImage = e => {
        if (e.target.files[0].size > 1048576 * 5) {
            alert('file is to big')
        }
        else {
            setImage(e.target.files[0])
        }
    }

    const handleScale = e => {
        const scale = parseFloat(e.target.value)
        setScale(scale)
    }

    const handlePositionChange = position => {
        setPosition(position)
    }

    const onClickSave = async () => {
        if (editor) {

            const canvasScaled = editor.current.getImageScaledToCanvas()
            canvasScaled.toBlob(async function (blob) {

                let formData = new FormData();
                formData.append("avatar", blob, "filename.png");


                let response = await fetch('/api/uploadavatar', {
                    method: 'POST',
                    body: formData
                });
                let result = await response.json();
                if (!result.error) {
                    props.updateAvatar(result)
                }
                else { alert(result.error) }
            });
        }
    }

    return (
        <div className='avatar-editor'>
            <div>
                <ReactAvatarEditor
                    ref={editor}
                    scale={parseFloat(scale)}
                    width={150}
                    height={150}
                    position={position}
                    onPositionChange={handlePositionChange}
                    rotate={0}
                    borderRadius={200 / (100 / 300)}
                    image={image}
                    className="editor-canvas center"
                />
            </div>

            <input id='avatar-input' className='hide' accept="image/*" name="newImage" type="file" onChange={handleNewImage} />
            <button className="btn center"><label className='avatar-input' htmlFor='avatar-input'>Choose Image</label></button>
            <input
                className='avatar-input-slider center'
                name="scale"
                type="range"
                onChange={handleScale}
                min="1"
                max="2"
                step="0.01"
                defaultValue="1"
                style={{}}
            />
            <button className='btn modal-close center' onClick={onClickSave}>Save</button>
        </div>
    )
}
