// Vite の機能: 指定パターンのファイルをまとめて import
// as: "raw" で中身を文字列として読み込む
export const notesMap = import.meta.glob('./docs/**/*.md', {
	as: 'raw',
	eager: true,
}) as Record<string, string>;

export type NoteItem = {
	/** 例: "React/hooks/useRef" */
	path: string;
	/** 例: "useRef" */
	name: string;
	/** 例: "React" */
	category: string;
	/** Markdown の本文 */
	content: string;
};

// 一覧表示用に整形
export const noteList: NoteItem[] = Object.entries(notesMap).map(
	([filePath, content]) => {
		// filePath = "./docs/React/hooks/useRef.md"
		const withoutPrefix = filePath.replace('./docs/', ''); // "React/hooks/useRef.md"
		const withoutExt = withoutPrefix.replace(/\.md$/, ''); // "React/hooks/useRef"
		const segments = withoutExt.split('/');
		const name = segments[segments.length - 1];
		const category = segments.length > 1 ? segments[0] : 'root';

		return {
			path: withoutExt, // URL の :path に使う
			name,
			category,
			content,
		};
	}
);
