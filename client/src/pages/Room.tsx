import { useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios"
import "../static/room.css";

import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import {indentWithTab} from "@codemirror/commands";
import { basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";


function Room() {
	const location = useLocation();
	const editorRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLTextareaElement | null>(null);
	const viewRef = useRef<EditorView | null>(null);

	useEffect(() => {
		if (!editorRef.current) return;

		const state = EditorState.create({
			doc: "",
			extensions: [
				basicSetup,
				keymap.of([indentWithTab]),
				python()
			]
		});

		const view = new EditorView({
			state,
			parent: editorRef.current
		})

		viewRef.current = view;
    	return () => view.destroy();
	}, [])

	const runCode = async() => {
		if (!viewRef.current) return;
		let code = viewRef.current.state.doc.text
		let input = inputRef.current.value.split("\n")
		
		const res = axios.post("http://localhost:3000/run", {
			language: "python",
			code,
			input
		}).catch(err => {
			console.log(`ERROR posting code ${err}`)
		})
	}

	return (
		<div className="container">
			<div className="top-container">
				<p>username</p>
				<p>Timer</p>
				<p>score</p>
			</div>
			<div className="main-container">
				<div className="members-container">
					<h1>ROOM: {location.state.roomId}</h1>
					<div className="sidebar-members">
						<div className="member">
							<p>username1 | points</p>
							<button>attack</button>
						</div>
					</div>
				</div>
				<div className="editor-container">
					<p>main code editor</p>
					<div ref={editorRef} className="code-editor" id="code-editor"/>
					<div className="input-output">
						<div>
							<p>Input:</p>
							<textarea ref={inputRef} className="input-editor" />
						</div>
						<div>
							<p>Output:</p>
							<div className="output-area"> </div>
						</div>
					</div>
					<button className="run-btn" onClick={runCode}>Run</button>
				</div>
				<div className="status-container">
					<select>
						<option>Trial</option>
					</select>
					<button>Submit</button>
					<p>Submissions</p>
					<div className="submission-area">
						<p>problem | status</p>
						<p>points</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Room;