import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = {
	markdown: string;
};

export const MarkdownViewer = ({ markdown }: Props) => {
	return (
		<div className='markdown-body'>
			<ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
		</div>
	);
};
