export const Loading = () => <div className="state"><span className="spinner"/>Gary is checking the cargo hold…</div>;
export const ErrorMessage = ({ message }: { message: string }) => <div className="state error">⚠ {message}</div>;
