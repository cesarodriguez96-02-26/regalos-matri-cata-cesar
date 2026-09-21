export async function getFlowDataFromRequest(request: Request) {
  const url = new URL(request.url);
  const commerceOrder = url.searchParams.get('commerceOrder')?.trim() ?? '';
  const tokenFromQuery = url.searchParams.get('token')?.trim() ?? '';

  if (tokenFromQuery) return { token: tokenFromQuery, commerceOrder };

  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const body = await request.json().catch(() => null);
    return {
      token: String(body?.token ?? '').trim(),
      commerceOrder: String(body?.commerceOrder ?? commerceOrder).trim()
    };
  }

  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const formData = await request.formData().catch(() => null);
    return {
      token: String(formData?.get('token') ?? '').trim(),
      commerceOrder: String(formData?.get('commerceOrder') ?? commerceOrder).trim()
    };
  }

  const text = await request.text().catch(() => '');
  const params = new URLSearchParams(text);
  return {
    token: String(params.get('token') ?? '').trim(),
    commerceOrder: String(params.get('commerceOrder') ?? commerceOrder).trim()
  };
}
