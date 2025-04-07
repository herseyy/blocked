import piston from "piston-client";

const client = piston({ server: "https://emkc.org" });

export async function runCode({ language, code, input }) {
	const joinedCode = code.join("\n");

	const result = await client.execute({
		language,
		files: [{ content: joinedCode }],
		stdin: input,
	});

	return result.run.output;
}