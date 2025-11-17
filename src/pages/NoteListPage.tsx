import { Link } from 'react-router-dom';
import { noteList } from '../notesMap';

export const NoteListPage = () => {
	// カテゴリごとにグループ化（ざっくり）
	const grouped = noteList.reduce<Record<string, typeof noteList>>(
		(acc, note) => {
			if (!acc[note.category]) acc[note.category] = [];
			acc[note.category].push(note);
			return acc;
		},
		{}
	);

	return (
		<div style={{ display: 'flex', gap: '2rem' }}>
			<div style={{ flex: 1 }}>
				<h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Notes</h1>

				{Object.entries(grouped).map(([category, notes]) => (
					<section key={category} style={{ marginBottom: '1.5rem' }}>
						<h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
							{category}
						</h2>
						<ul style={{ paddingLeft: '1.2rem' }}>
							{notes.map((note) => (
								<li key={note.path} style={{ marginBottom: '0.25rem' }}>
									<Link
										to={`/note/${note.path}`}
										style={{ textDecoration: 'none', color: '#0366d6' }}
									>
										{note.name}
									</Link>
								</li>
							))}
						</ul>
					</section>
				))}
			</div>
		</div>
	);
};
