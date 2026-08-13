using WaySpot.Core.Models;

namespace WaySpot.Core.Interfaces;

public interface IBruteForceProtectionService
{
    Task<bool> IsBlockedAsync(string ip);
    Task RecordFailedLoginAsync(string ip);
    Task ResetFailedLoginAsync(string ip);
}
