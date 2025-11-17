import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { NoteListPage } from './pages/NoteListPage';
import { NotePage } from './pages/NotePage';

function App() {
	return (
		<Layout>
			<Routes>
				<Route path='/' element={<NoteListPage />} />
				{/* :path* を使うと react/use-state-basic のような階層パスも扱える */}
				<Route path='/note/:path*' element={<NotePage />} />
				<Route path='*' element={<Navigate to='/' replace />} />
			</Routes>
		</Layout>
	);
}

export default App;
