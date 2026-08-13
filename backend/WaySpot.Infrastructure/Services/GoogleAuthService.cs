using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using WaySpot.Core.Interfaces;

namespace WaySpot.Infrastructure.Services;

public static class GoogleAuthService
{
    private static readonly HttpClient _httpClient = new();

    public static async Task<Dictionary<string, string>?> ValidateAsync(string idToken)
    {
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Get,
                $"https://oauth2.googleapis.com/tokeninfo?id_token={idToken}");
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            using var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode) return null;

            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<Dictionary<string, string>>(json);
        }
        catch
        {
            return null;
        }
    }
}
