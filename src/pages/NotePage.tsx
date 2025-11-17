import { useParams, Link } from 'react-router-dom';
import { noteList } from '../notesMap';
import { MarkdownViewer } from '../components/MarkdownViewer';

export const NotePage = () => {
	const { path = '' } = useParams<{ path: string }>();

	const note = noteList.find((n) => n.path === path);

	if (!note) {
		return (
			<div>
				<p>ノートが見つかりませんでした。</p>
				<Link to='/' style={{ color: '#0366d6' }}>
					← 一覧に戻る
				</Link>
			</div>
		);
	}

	return (
		<div style={{ display: 'flex', gap: '2rem' }}>
			<aside style={{ width: 220, fontSize: 14 }}>
				<div style={{ marginBottom: '1rem' }}>
					<Link to='/' style={{ color: '#0366d6' }}>
						← 一覧に戻る
					</Link>
				</div>
				<div>
					<div style={{ fontWeight: 600, marginBottom: 4 }}>Category</div>
					<div>{note.category}</div>
				</div>
			</aside>

			<article style={{ flex: 1, minWidth: 0 }}>
				<h1 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>
					{note.name}
				</h1>
				<MarkdownViewer markdown={note.content} />
			</article>
		</div>
	);
};
