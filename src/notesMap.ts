// Vite の機能: 指定パターンのファイルをまとめて import
// as: "raw" で中身を文字列として読み込む
export const notesMap = import.meta.glob('./notes/**/*.md', {
	as: 'raw',
	eager: true,
}) as Record<string, string>;

export type NoteItem = {
	/** 例: "react/use-state-basic" */
	path: string;
	/** 例: "use-state-basic" */
	name: string;
	/** 例: "react" */
	category: string;
	/** Markdown の本文 */
	content: string;
};

// 一覧表示用に整形
export const noteList: NoteItem[] = Object.entries(notesMap).map(
	([filePath, content]) => {
		// filePath = "./notes/react/use-state-basic.md"
		const withoutPrefix = filePath.replace('./notes/', ''); // "react/use-state-basic.md"
		const withoutExt = withoutPrefix.replace(/\.md$/, ''); // "react/use-state-basic"
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
