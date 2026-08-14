using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaySpot.Core.Entities;
using WaySpot.Infrastructure.Data;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SocialController : ControllerBase
{
    private readonly WaySpotDbContext _context;

    public SocialController(WaySpotDbContext context)
    {
        _context = context;
    }

    private Guid GetCurrentUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) 
                   ?? User.FindFirstValue("id") 
                   ?? User.FindFirstValue("sub");

        if (Guid.TryParse(idClaim, out var guid)) return guid;

        // Fallback user if unauthenticated
        var anyUser = _context.Users.FirstOrDefault(u => u.Email == "cafe@wayspot.com") ?? _context.Users.FirstOrDefault();
        return anyUser?.Id ?? Guid.NewGuid();
    }

    // Toggle follow/unfollow
    [HttpPost("follow/{targetUserId:guid}")]
    public async Task<IActionResult> ToggleFollow(Guid targetUserId)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == targetUserId)
        {
            return BadRequest(new { message = "Kendinizi takip edemezsiniz." });
        }

        var targetUser = await _context.Users.FindAsync(targetUserId);
        if (targetUser == null)
        {
            return NotFound(new { message = "Kullanıcı bulunamadı." });
        }

        var existingFollow = await _context.UserFollows
            .FirstOrDefaultAsync(f => f.FollowerId == currentUserId && f.FollowingId == targetUserId);

        bool isFollowing;
        if (existingFollow != null)
        {
            _context.UserFollows.Remove(existingFollow);
            isFollowing = false;
        }
        else
        {
            _context.UserFollows.Add(new UserFollow
            {
                Id = Guid.NewGuid(),
                FollowerId = currentUserId,
                FollowingId = targetUserId,
                CreatedAt = DateTime.UtcNow
            });
            isFollowing = true;
        }

        await _context.SaveChangesAsync();

        var followerCount = await _context.UserFollows.CountAsync(f => f.FollowingId == targetUserId);

        return Ok(new
        {
            isFollowing,
            followerCount,
            message = isFollowing ? $"{targetUser.Username} takip ediliyor." : $"{targetUser.Username} takipten çıkarıldı."
        });
    }

    // Get followers of a user
    [HttpGet("followers/{userId:guid}")]
    public async Task<IActionResult> GetFollowers(Guid userId)
    {
        var currentUserId = GetCurrentUserId();

        var followers = await _context.UserFollows
            .Where(f => f.FollowingId == userId)
            .Include(f => f.Follower)
            .ThenInclude(u => u.Business)
            .Select(f => new
            {
                f.Follower.Id,
                f.Follower.Username,
                f.Follower.FirstName,
                f.Follower.LastName,
                f.Follower.ProfileImage,
                Role = f.Follower.Role.ToString(),
                BusinessName = f.Follower.Business != null ? f.Follower.Business.Name : null,
                f.CreatedAt,
                IsFollowedByMe = _context.UserFollows.Any(x => x.FollowerId == currentUserId && x.FollowingId == f.Follower.Id)
            })
            .ToListAsync();

        return Ok(followers);
    }

    // Get users followed by a user
    [HttpGet("following/{userId:guid}")]
    public async Task<IActionResult> GetFollowing(Guid userId)
    {
        var currentUserId = GetCurrentUserId();

        var following = await _context.UserFollows
            .Where(f => f.FollowerId == userId)
            .Include(f => f.Following)
            .ThenInclude(u => u.Business)
            .Select(f => new
            {
                f.Following.Id,
                f.Following.Username,
                f.Following.FirstName,
                f.Following.LastName,
                f.Following.ProfileImage,
                Role = f.Following.Role.ToString(),
                BusinessName = f.Following.Business != null ? f.Following.Business.Name : null,
                f.CreatedAt,
                IsFollowedByMe = _context.UserFollows.Any(x => x.FollowerId == currentUserId && x.FollowingId == f.Following.Id)
            })
            .ToListAsync();

        return Ok(following);
    }

    // Get current user's friends / followed users for quick route sharing
    [HttpGet("friends")]
    public async Task<IActionResult> GetFriends()
    {
        var currentUserId = GetCurrentUserId();

        var followedUsers = await _context.UserFollows
            .Where(f => f.FollowerId == currentUserId)
            .Include(f => f.Following)
            .ThenInclude(u => u.Business)
            .Select(f => new
            {
                f.Following.Id,
                f.Following.Username,
                DisplayName = f.Following.Business != null ? f.Following.Business.Name : $"{f.Following.FirstName} {f.Following.LastName}".Trim(),
                f.Following.ProfileImage,
                Role = f.Following.Role.ToString(),
                BusinessName = f.Following.Business != null ? f.Following.Business.Name : null
            })
            .ToListAsync();

        // Also if the current user is a business, get all their followers
        var myFollowers = await _context.UserFollows
            .Where(f => f.FollowingId == currentUserId)
            .Include(f => f.Follower)
            .ThenInclude(u => u.Business)
            .Select(f => new
            {
                f.Follower.Id,
                f.Follower.Username,
                DisplayName = f.Follower.Business != null ? f.Follower.Business.Name : $"{f.Follower.FirstName} {f.Follower.LastName}".Trim(),
                f.Follower.ProfileImage,
                Role = f.Follower.Role.ToString(),
                BusinessName = f.Follower.Business != null ? f.Follower.Business.Name : null
            })
            .ToListAsync();

        return Ok(new
        {
            following = followedUsers,
            followers = myFollowers
        });
    }

    // Search users and businesses
    [HttpGet("search-users")]
    public async Task<IActionResult> SearchUsers([FromQuery] string query)
    {
        var currentUserId = GetCurrentUserId();
        var q = (query ?? string.Empty).ToLower().Trim();

        var users = await _context.Users
            .Where(u => u.Id != currentUserId && (
                u.Username.ToLower().Contains(q) ||
                (u.FirstName != null && u.FirstName.ToLower().Contains(q)) ||
                (u.LastName != null && u.LastName.ToLower().Contains(q)) ||
                (u.Business != null && u.Business.Name.ToLower().Contains(q))
            ))
            .Include(u => u.Business)
            .Take(20)
            .Select(u => new
            {
                u.Id,
                u.Username,
                DisplayName = u.Business != null ? u.Business.Name : $"{u.FirstName} {u.LastName}".Trim(),
                u.ProfileImage,
                Role = u.Role.ToString(),
                BusinessName = u.Business != null ? u.Business.Name : null,
                IsFollowedByMe = _context.UserFollows.Any(f => f.FollowerId == currentUserId && f.FollowingId == u.Id)
            })
            .ToListAsync();

        return Ok(users);
    }

    // Public user/friend profile
    [HttpGet("user-profile/{userId:guid}")]
    public async Task<IActionResult> GetUserProfile(Guid userId)
    {
        var currentUserId = GetCurrentUserId();

        var user = await _context.Users
            .Include(u => u.Business)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return NotFound(new { message = "Kullanıcı bulunamadı." });

        var followerCount = await _context.UserFollows.CountAsync(f => f.FollowingId == userId);
        var followingCount = await _context.UserFollows.CountAsync(f => f.FollowerId == userId);
        var isFollowedByMe = await _context.UserFollows.AnyAsync(f => f.FollowerId == currentUserId && f.FollowingId == userId);

        var savedRoutes = await _context.Routes
            .Where(r => r.UserId == userId && r.IsSaved)
            .Include(r => r.RouteStops)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Name,
                r.StartLocation,
                r.EndLocation,
                r.TotalDistanceKm,
                r.EstimatedDurationMinutes,
                StopCount = r.RouteStops.Count,
                r.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            user.Id,
            user.Username,
            DisplayName = user.Business != null ? user.Business.Name : $"{user.FirstName} {user.LastName}".Trim(),
            user.FirstName,
            user.LastName,
            user.ProfileImage,
            user.Bio,
            Role = user.Role.ToString(),
            Business = user.Business != null ? new
            {
                user.Business.Id,
                user.Business.Name,
                user.Business.Type,
                user.Business.CoverImage,
                user.Business.Address,
                user.Business.AverageRating,
                user.Business.TotalReviews
            } : null,
            FollowerCount = followerCount,
            FollowingCount = followingCount,
            IsFollowedByMe = isFollowedByMe,
            SavedRoutes = savedRoutes
        });
    }
}
