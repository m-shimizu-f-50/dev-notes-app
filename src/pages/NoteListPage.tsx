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
		<div>
			<h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: 600 }}>
				Notes
			</h1>

			{Object.entries(grouped).map(([category, notes]) => (
				<section key={category} style={{ marginBottom: '2rem' }}>
					<h2
						style={{
							fontSize: '1.3rem',
							marginBottom: '0.75rem',
							fontWeight: 600,
							color: '#333',
						}}
					>
						{category}
					</h2>
					<ul style={{ paddingLeft: '1.5rem', listStyle: 'disc' }}>
						{notes.map((note) => (
							<li key={note.path} style={{ marginBottom: '0.5rem' }}>
								<Link
									to={`/note/${note.path}`}
									style={{
										textDecoration: 'none',
										color: '#0366d6',
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.textDecoration = 'underline';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.textDecoration = 'none';
									}}
								>
									{note.name}
								</Link>
							</li>
						))}
					</ul>
				</section>
			))}
		</div>
	);
};
