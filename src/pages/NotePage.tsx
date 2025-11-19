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
			<aside style={{ width: 200, fontSize: 14, flexShrink: 0 }}>
				<div style={{ marginBottom: '1.5rem' }}>
					<Link
						to='/'
						style={{
							color: '#0366d6',
							textDecoration: 'none',
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.textDecoration = 'underline';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.textDecoration = 'none';
						}}
					>
						← 一覧に戻る
					</Link>
				</div>
				<div
					style={{
						padding: '0.75rem',
						background: '#f6f8fa',
						borderRadius: '6px',
					}}
				>
					<div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: 12 }}>
						Category
					</div>
					<div style={{ fontSize: 13 }}>{note.category}</div>
				</div>
			</aside>

			<article style={{ flex: 1, minWidth: 0, maxWidth: '100%' }}>
				<MarkdownViewer markdown={note.content} />
			</article>
		</div>
	);
};
