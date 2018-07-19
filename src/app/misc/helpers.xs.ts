import xs from 'xstream'

// when the stream returns an error, replace an error on the stream with a non erroneous stream (ie don't kill the stream),
// with an error property on it to identify
export function simpleHttpResponseReplaceError(response$) {
	return response$.replaceError(err => {
		const body = {
			error: err,
			message: null,
		}

		switch (err.status) {
			case 404:
				body.message = '404 Not found'
				break
			case 403:
				body.message = '403 Not authorized'
				break
			case 401:
				body.message = '401 Not authenticated'
				break
			default:
				body.message = 'Generic server error'
				break
		}

		return xs.of({
			body,
		})
	})
}
