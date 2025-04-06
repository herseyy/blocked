import { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios"
import styles from "../static/room.module.css";

import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import {indentWithTab} from "@codemirror/commands";
import { basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";


function Room({ user, role }) {
	const location = useLocation();
	const editorRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLTextareaElement | null>(null);
	const viewRef = useRef<EditorView | null>(null);
	const roomId = location.state.roomId

	const [result, setResult] = useState();
	const [testCases, setTestCases] = useState({});

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


	const fetchData = async () => {
		console.log("helllooo")
		try {
			console.log(roomId);
			console.log(user.uid);

			// Make the API request
			const res = await axios.get(`http://localhost:3000/api/rooms/getRoom?roomId=${roomId}`);
			// console.log(res.data);
			setTestCases(res.data)
		} catch (err) {
			console.log(err.message);
		}
	};

	useEffect(() => {
		fetchData()
	}, [])

	const runCode = async() => {
		if (!viewRef.current) return;
		let code = viewRef.current.state.doc.text
		let input = inputRef.current.value.split("\n")
		
		axios.post("http://localhost:3000/run", {
			language: "python",
			code,
			input
		}).then((res) => {
			console.log(res.data)
			setResult(res.data)
		}).catch((err) => {
			console.log(`ERROR posting code ${err}`)
		})
	}

	return (
		<div>
			{role == "admin" ? 
				<div className={styles.container}>
					<div className={styles.topContainer}>
						<p>Room ID: {roomId}</p>
						<p>User ID: {user.uid}</p>
					</div>
					<div>
						<div>
							<label htmlFor="hr">Hour/s: </label>
							<input id="hr"/>
						</div>
						<div>
							<label htmlFor="min">Minute/s: </label>
							<input id="min"/>
						</div>
						<div>
							<label htmlFor="sec">Second/s: </label>
							<input id="sec"/>
						</div>
						<button>Start Timer</button>
					</div>
					<div className={styles.mainContainer}>
						<div className={styles.membersContainer}>
							<h1>Submissions</h1>
							<div className={styles.sidebarMembers}>
								<div className={styles.member}>
									<p>problem | team</p>
									<button>check</button>
								</div>
								<div className={styles.member}>
									<p>problem | team</p>
									<button>check</button>
								</div>
							</div>
						</div>

						<div className={styles.editorContainer}>
							Code
						</div>

						<div className={styles.statusContainer}>
							{Object.keys(testCases).map((problem) => {
								const testCase = testCases[problem];
								return(
									<div key={problem}>
										<h2>{problem}</h2>
										{Object.keys(testCase).map((index) => {
										  const currentTestCase = testCase[index];

										  // Check if the current test case exists
										  if (!currentTestCase) {
										    return null; // Skip this iteration if the test case is invalid
										  }

										  return (
										    <div key={index}>
										      <p>Test Case: {Number(index) + 1}</p>
										      <pre>{currentTestCase.input}</pre>
										      <pre>{currentTestCase.output}</pre>
										    </div>
										  );
										})}
									</div>
								)
							})}
						</div>
					</div>
				</div>
			:	
				<div className={styles.container}>
					<div className={styles.topContainer}>
						<p>username</p>
						<p>Timer</p>
						<p>score</p>
					</div>
					<div className={styles.mainContainer}>
						<div className={styles.membersContainer}>
							<h1>ROOM: {roomId}</h1>
							<div className={styles.sidebarMembers}>
								<div className={styles.member}>
									<p>username1 | points</p>
									<button>attack</button>
								</div>
							</div>
						</div>
						<div className={styles.editorContainer}>
							<p>main code editor</p>
							<div ref={editorRef} className={styles.codeEditor} id="code-editor"/>
							<div className="input-output">
								<div>
									<p>Input:</p>
									<textarea ref={inputRef} className={styles.inputEditor} />
								</div>
								<div>
									<p>Output:</p>
									<div className={styles.outputArea}>{result}</div>
								</div>
							</div>
							<button className={styles.runBtn} onClick={runCode}>Run</button>
						</div>
						<div className={styles.statusContainer}>
							<select>
								<option>Trial</option>
							</select>
							<button>Submit</button>
							<p>Submissions</p>
							<div className={styles.submissionArea}>
								<p>problem | status</p>
								<p>points</p>
							</div>
						</div>
					</div>
				</div>
			}
		</div>
	)
}

export default Room;