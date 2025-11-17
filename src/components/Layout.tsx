import type { ReactNode } from 'react';

type LayoutProps = {
	children: ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
	return (
		<div
			style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
		>
			<header
				style={{
					padding: '0.75rem 1rem',
					borderBottom: '1px solid #e5e5e5',
					fontWeight: 600,
				}}
			>
				Dev Notes
			</header>

			<main
				style={{ flex: 1, padding: '1rem', maxWidth: 1200, margin: '0 auto' }}
			>
				{children}
			</main>

			<footer
				style={{
					padding: '0.75rem 1rem',
					borderTop: '1px solid #e5e5e5',
					fontSize: 12,
					color: '#666',
					textAlign: 'right',
				}}
			>
				自分用開発メモ
			</footer>
		</div>
	);
};
