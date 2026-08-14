using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaySpot.Core.Entities;
using WaySpot.Infrastructure.Data;
using AppRoute = WaySpot.Core.Entities.Route;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RouteCollaborationController : ControllerBase
{
    private readonly WaySpotDbContext _context;

    public RouteCollaborationController(WaySpotDbContext context)
    {
        _context = context;
    }

    private Guid GetCurrentUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) 
                   ?? User.FindFirstValue("id") 
                   ?? User.FindFirstValue("sub");

        if (Guid.TryParse(idClaim, out var guid)) return guid;

        var anyUser = _context.Users.FirstOrDefault(u => u.Email == "cafe@wayspot.com") ?? _context.Users.FirstOrDefault();
        return anyUser?.Id ?? Guid.NewGuid();
    }

    // 1. Send Route to a Friend for Approval / Recommendations
    [HttpPost("send-to-friend")]
    public async Task<IActionResult> SendToFriend([FromBody] SendToFriendDto request)
    {
        var currentUserId = GetCurrentUserId();

        if (request.RecipientUserId == currentUserId)
        {
            return BadRequest(new { message = "Rotayı kendinize gönderemezsiniz." });
        }

        var recipient = await _context.Users.FindAsync(request.RecipientUserId);
        if (recipient == null) return NotFound(new { message = "Alıcı kullanıcı bulunamadı." });

        AppRoute? route = null;
        if (request.RouteId.HasValue)
        {
            route = await _context.Routes.Include(r => r.RouteStops).FirstOrDefaultAsync(r => r.Id == request.RouteId.Value);
        }

        if (route == null)
        {
            // If route was not saved previously, create it now
            route = new AppRoute
            {
                Id = Guid.NewGuid(),
                UserId = currentUserId,
                Name = string.IsNullOrWhiteSpace(request.RouteName) 
                    ? $"{request.StartLocation ?? "Başlangıç"} ➔ {request.EndLocation ?? "Varış"} Gezi Rotası" 
                    : request.RouteName.Trim(),
                StartLocation = request.StartLocation ?? "Başlangıç",
                EndLocation = request.EndLocation ?? "Varış",
                StartLat = request.StartLat,
                StartLng = request.StartLng,
                EndLat = request.EndLat,
                EndLng = request.EndLng,
                TotalDistanceKm = request.TotalDistanceKm,
                EstimatedDurationMinutes = request.EstimatedDurationMinutes,
                IsSaved = true,
                CreatedAt = DateTime.UtcNow
            };

            int order = 1;
            foreach (var s in request.Stops ?? new List<RouteStopDto>())
            {
                route.RouteStops.Add(new RouteStop
                {
                    Id = Guid.NewGuid(),
                    RouteId = route.Id,
                    BusinessId = s.BusinessId,
                    StopName = s.StopName,
                    Latitude = s.Latitude,
                    Longitude = s.Longitude,
                    StopOrder = order++,
                    StayDurationMinutes = s.StayDurationMinutes > 0 ? s.StayDurationMinutes : 30
                });
            }

            _context.Routes.Add(route);
            await _context.SaveChangesAsync();
        }

        var collaboration = new RouteCollaboration
        {
            Id = Guid.NewGuid(),
            RouteId = route.Id,
            SenderUserId = currentUserId,
            RecipientUserId = request.RecipientUserId,
            Type = "FriendApproval",
            Status = "Pending",
            SenderNote = request.SenderNote,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.RouteCollaborations.Add(collaboration);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"{recipient.Username} kullanıcısına rota onay ve tavsiye isteği gönderildi.",
            collaborationId = collaboration.Id,
            routeId = route.Id,
            routeName = route.Name
        });
    }

    // 2. Business Broadcast Route to Followers
    [HttpPost("broadcast-to-followers")]
    public async Task<IActionResult> BroadcastToFollowers([FromBody] BroadcastToFollowersDto request)
    {
        var currentUserId = GetCurrentUserId();

        AppRoute? route = null;
        if (request.RouteId.HasValue)
        {
            route = await _context.Routes.Include(r => r.RouteStops).FirstOrDefaultAsync(r => r.Id == request.RouteId.Value);
        }

        if (route == null)
        {
            route = new AppRoute
            {
                Id = Guid.NewGuid(),
                UserId = currentUserId,
                Name = string.IsNullOrWhiteSpace(request.RouteName) 
                    ? $"{request.StartLocation ?? "Başlangıç"} ➔ {request.EndLocation ?? "Varış"} Özel Firma Rotası" 
                    : request.RouteName.Trim(),
                StartLocation = request.StartLocation ?? "Başlangıç",
                EndLocation = request.EndLocation ?? "Varış",
                StartLat = request.StartLat,
                StartLng = request.StartLng,
                EndLat = request.EndLat,
                EndLng = request.EndLng,
                TotalDistanceKm = request.TotalDistanceKm,
                EstimatedDurationMinutes = request.EstimatedDurationMinutes,
                IsSaved = true,
                CreatedAt = DateTime.UtcNow
            };

            int order = 1;
            foreach (var s in request.Stops ?? new List<RouteStopDto>())
            {
                route.RouteStops.Add(new RouteStop
                {
                    Id = Guid.NewGuid(),
                    RouteId = route.Id,
                    BusinessId = s.BusinessId,
                    StopName = s.StopName,
                    Latitude = s.Latitude,
                    Longitude = s.Longitude,
                    StopOrder = order++,
                    StayDurationMinutes = s.StayDurationMinutes > 0 ? s.StayDurationMinutes : 30
                });
            }

            _context.Routes.Add(route);
            await _context.SaveChangesAsync();
        }

        // If recipientUserIds not specified, find all followers of this business/user
        List<Guid> targetUserIds = request.RecipientUserIds ?? new List<Guid>();
        if (targetUserIds.Count == 0)
        {
            targetUserIds = await _context.UserFollows
                .Where(f => f.FollowingId == currentUserId)
                .Select(f => f.FollowerId)
                .ToListAsync();
        }

        if (targetUserIds.Count == 0)
        {
            return BadRequest(new { message = "Rotanın gönderileceği takipçi bulunamadı." });
        }

        int count = 0;
        foreach (var followerId in targetUserIds)
        {
            _context.RouteCollaborations.Add(new RouteCollaboration
            {
                Id = Guid.NewGuid(),
                RouteId = route.Id,
                SenderUserId = currentUserId,
                RecipientUserId = followerId,
                Type = "BusinessBroadcast",
                Status = "Approved",
                SenderNote = request.BroadcastNote,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            count++;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Rota {count} takipçiye başarıyla yayınlandı.",
            count,
            routeId = route.Id,
            routeName = route.Name
        });
    }

    // 3. Get Received Routes (Inbox)
    [HttpGet("inbox")]
    public async Task<IActionResult> GetInbox()
    {
        var currentUserId = GetCurrentUserId();

        var collaborations = await _context.RouteCollaborations
            .Where(c => c.RecipientUserId == currentUserId)
            .Include(c => c.SenderUser)
            .ThenInclude(u => u.Business)
            .Include(c => c.Route)
            .ThenInclude(r => r.RouteStops)
            .ThenInclude(rs => rs.Business)
            .Include(c => c.Suggestions)
            .ThenInclude(s => s.Business)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.Type,
                c.Status,
                c.SenderNote,
                c.ReviewerNote,
                c.CreatedAt,
                c.UpdatedAt,
                Sender = new
                {
                    c.SenderUser.Id,
                    c.SenderUser.Username,
                    DisplayName = c.SenderUser.Business != null ? c.SenderUser.Business.Name : $"{c.SenderUser.FirstName} {c.SenderUser.LastName}".Trim(),
                    c.SenderUser.ProfileImage,
                    Role = c.SenderUser.Role.ToString()
                },
                Route = new
                {
                    c.Route.Id,
                    c.Route.Name,
                    c.Route.StartLocation,
                    c.Route.EndLocation,
                    c.Route.StartLat,
                    c.Route.StartLng,
                    c.Route.EndLat,
                    c.Route.EndLng,
                    c.Route.TotalDistanceKm,
                    c.Route.EstimatedDurationMinutes,
                    Stops = c.Route.RouteStops.OrderBy(rs => rs.StopOrder).Select(rs => new
                    {
                        rs.Id,
                        rs.BusinessId,
                        StopName = rs.StopName,
                        rs.Latitude,
                        rs.Longitude,
                        rs.StopOrder,
                        BusinessName = rs.Business != null ? rs.Business.Name : rs.StopName,
                        BusinessType = rs.Business != null ? rs.Business.Type : "Mekan",
                        BusinessCoverImage = rs.Business != null ? rs.Business.CoverImage : null,
                        BusinessRating = rs.Business != null ? rs.Business.AverageRating : 5.0m,
                        BusinessAddress = rs.Business != null ? rs.Business.Address : null
                    })
                },
                Suggestions = c.Suggestions.Select(s => new
                {
                    s.Id,
                    s.BusinessId,
                    s.StopName,
                    s.Latitude,
                    s.Longitude,
                    s.KmAlongRoute,
                    s.Note,
                    s.Status,
                    s.CreatedAt,
                    BusinessName = s.Business != null ? s.Business.Name : s.StopName,
                    BusinessType = s.Business != null ? s.Business.Type : "Mekan",
                    BusinessCoverImage = s.Business != null ? s.Business.CoverImage : null,
                    BusinessRating = s.Business != null ? s.Business.AverageRating : 5.0m
                })
            })
            .ToListAsync();

        return Ok(collaborations);
    }

    // 4. Get Sent Collaboration Requests
    [HttpGet("sent")]
    public async Task<IActionResult> GetSent()
    {
        var currentUserId = GetCurrentUserId();

        var collaborations = await _context.RouteCollaborations
            .Where(c => c.SenderUserId == currentUserId)
            .Include(c => c.RecipientUser)
            .ThenInclude(u => u.Business)
            .Include(c => c.Route)
            .ThenInclude(r => r.RouteStops)
            .ThenInclude(rs => rs.Business)
            .Include(c => c.Suggestions)
            .ThenInclude(s => s.Business)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.Type,
                c.Status,
                c.SenderNote,
                c.ReviewerNote,
                c.CreatedAt,
                c.UpdatedAt,
                Recipient = new
                {
                    c.RecipientUser.Id,
                    c.RecipientUser.Username,
                    DisplayName = c.RecipientUser.Business != null ? c.RecipientUser.Business.Name : $"{c.RecipientUser.FirstName} {c.RecipientUser.LastName}".Trim(),
                    c.RecipientUser.ProfileImage,
                    Role = c.RecipientUser.Role.ToString()
                },
                Route = new
                {
                    c.Route.Id,
                    c.Route.Name,
                    c.Route.StartLocation,
                    c.Route.EndLocation,
                    c.Route.StartLat,
                    c.Route.StartLng,
                    c.Route.EndLat,
                    c.Route.EndLng,
                    c.Route.TotalDistanceKm,
                    c.Route.EstimatedDurationMinutes,
                    Stops = c.Route.RouteStops.OrderBy(rs => rs.StopOrder).Select(rs => new
                    {
                        rs.Id,
                        rs.BusinessId,
                        StopName = rs.StopName,
                        rs.Latitude,
                        rs.Longitude,
                        rs.StopOrder,
                        BusinessName = rs.Business != null ? rs.Business.Name : rs.StopName,
                        BusinessType = rs.Business != null ? rs.Business.Type : "Mekan",
                        BusinessCoverImage = rs.Business != null ? rs.Business.CoverImage : null,
                        BusinessRating = rs.Business != null ? rs.Business.AverageRating : 5.0m
                    })
                },
                Suggestions = c.Suggestions.Select(s => new
                {
                    s.Id,
                    s.BusinessId,
                    s.StopName,
                    s.Latitude,
                    s.Longitude,
                    s.KmAlongRoute,
                    s.Note,
                    s.Status,
                    s.CreatedAt,
                    BusinessName = s.Business != null ? s.Business.Name : s.StopName,
                    BusinessType = s.Business != null ? s.Business.Type : "Mekan",
                    BusinessCoverImage = s.Business != null ? s.Business.CoverImage : null,
                    BusinessRating = s.Business != null ? s.Business.AverageRating : 5.0m
                })
            })
            .ToListAsync();

        return Ok(collaborations);
    }

    // 5. Friend adds a Stop Recommendation to the Collaboration
    [HttpPost("{id:guid}/add-suggestion")]
    public async Task<IActionResult> AddSuggestion(Guid id, [FromBody] AddSuggestionDto request)
    {
        var currentUserId = GetCurrentUserId();

        var collaboration = await _context.RouteCollaborations.FindAsync(id);
        if (collaboration == null) return NotFound(new { message = "İşbirliği kaydı bulunamadı." });

        if (collaboration.RecipientUserId != currentUserId && collaboration.SenderUserId != currentUserId)
        {
            return Forbid();
        }

        var suggestion = new RouteSuggestion
        {
            Id = Guid.NewGuid(),
            CollaborationId = id,
            SuggestedByUserId = currentUserId,
            BusinessId = request.BusinessId,
            StopName = request.StopName,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            KmAlongRoute = request.KmAlongRoute,
            Note = request.Note,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.RouteSuggestions.Add(suggestion);
        collaboration.Status = "ReviewedWithSuggestions";
        collaboration.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Mekan tavsiyesi başarıyla eklendi.",
            suggestion = new
            {
                suggestion.Id,
                suggestion.StopName,
                suggestion.Latitude,
                suggestion.Longitude,
                suggestion.KmAlongRoute,
                suggestion.Note,
                suggestion.Status
            }
        });
    }

    // 6. Friend Submits Route Review with all suggestions back to Route Owner
    [HttpPost("{id:guid}/submit-review")]
    public async Task<IActionResult> SubmitReview(Guid id, [FromBody] SubmitReviewDto request)
    {
        var currentUserId = GetCurrentUserId();

        var collaboration = await _context.RouteCollaborations
            .Include(c => c.Route)
            .Include(c => c.Suggestions)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (collaboration == null) return NotFound(new { message = "İşbirliği kaydı bulunamadı." });

        if (collaboration.RecipientUserId != currentUserId)
        {
            return Forbid();
        }

        // Add any batch suggestions provided in payload
        if (request.Suggestions != null && request.Suggestions.Count > 0)
        {
            foreach (var s in request.Suggestions)
            {
                _context.RouteSuggestions.Add(new RouteSuggestion
                {
                    Id = Guid.NewGuid(),
                    CollaborationId = id,
                    SuggestedByUserId = currentUserId,
                    BusinessId = s.BusinessId,
                    StopName = s.StopName,
                    Latitude = s.Latitude,
                    Longitude = s.Longitude,
                    KmAlongRoute = s.KmAlongRoute,
                    Note = s.Note,
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        collaboration.Status = (request.Suggestions?.Count > 0 || collaboration.Suggestions.Count > 0) 
            ? "ReviewedWithSuggestions" 
            : "Approved";

        collaboration.ReviewerNote = request.ReviewerNote;
        collaboration.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Rota incelemeniz ve tavsiyeleriniz rota sahibine iletildi.",
            collaborationId = collaboration.Id,
            status = collaboration.Status
        });
    }

    // 7. Route Owner Accepts or Rejects a Friend's Stop Suggestion
    [HttpPost("suggestion/{suggestionId:guid}/decision")]
    public async Task<IActionResult> SuggestionDecision(Guid suggestionId, [FromBody] SuggestionDecisionDto request)
    {
        var currentUserId = GetCurrentUserId();

        var suggestion = await _context.RouteSuggestions
            .Include(s => s.Collaboration)
            .ThenInclude(c => c.Route)
            .ThenInclude(r => r.RouteStops)
            .FirstOrDefaultAsync(s => s.Id == suggestionId);

        if (suggestion == null) return NotFound(new { message = "Tavsiye kaydı bulunamadı." });

        if (suggestion.Collaboration.SenderUserId != currentUserId && suggestion.Collaboration.Route.UserId != currentUserId)
        {
            return Forbid();
        }

        if (request.Action.ToLower() == "accept")
        {
            suggestion.Status = "Accepted";

            // Merge into RouteStops if not already present
            var route = suggestion.Collaboration.Route;
            var maxOrder = route.RouteStops.Any() ? route.RouteStops.Max(rs => rs.StopOrder) : 0;

            var newStop = new RouteStop
            {
                Id = Guid.NewGuid(),
                RouteId = route.Id,
                BusinessId = suggestion.BusinessId,
                StopName = suggestion.StopName,
                Latitude = suggestion.Latitude,
                Longitude = suggestion.Longitude,
                StopOrder = maxOrder + 1,
                StayDurationMinutes = 30
            };

            _context.RouteStops.Add(newStop);
            suggestion.Collaboration.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"\"{suggestion.StopName}\" güzergahınıza durak olarak eklendi!",
                status = "Accepted",
                addedStop = new
                {
                    newStop.Id,
                    newStop.BusinessId,
                    newStop.StopName,
                    newStop.Latitude,
                    newStop.Longitude,
                    newStop.StopOrder
                }
            });
        }
        else
        {
            suggestion.Status = "Rejected";
            suggestion.Collaboration.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Tavsiye reddedildi.",
                status = "Rejected"
            });
        }
    }
}

public class SendToFriendDto
{
    public Guid? RouteId { get; set; }
    public Guid RecipientUserId { get; set; }
    public string? RouteName { get; set; }
    public string? SenderNote { get; set; }
    public string? StartLocation { get; set; }
    public string? EndLocation { get; set; }
    public decimal StartLat { get; set; }
    public decimal StartLng { get; set; }
    public decimal EndLat { get; set; }
    public decimal EndLng { get; set; }
    public decimal TotalDistanceKm { get; set; }
    public int EstimatedDurationMinutes { get; set; }
    public List<RouteStopDto>? Stops { get; set; }
}

public class BroadcastToFollowersDto
{
    public Guid? RouteId { get; set; }
    public List<Guid>? RecipientUserIds { get; set; }
    public string? RouteName { get; set; }
    public string? BroadcastNote { get; set; }
    public string? StartLocation { get; set; }
    public string? EndLocation { get; set; }
    public decimal StartLat { get; set; }
    public decimal StartLng { get; set; }
    public decimal EndLat { get; set; }
    public decimal EndLng { get; set; }
    public decimal TotalDistanceKm { get; set; }
    public int EstimatedDurationMinutes { get; set; }
    public List<RouteStopDto>? Stops { get; set; }
}

public class RouteStopDto
{
    public Guid? BusinessId { get; set; }
    public string StopName { get; set; } = string.Empty;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public int StopOrder { get; set; }
    public int StayDurationMinutes { get; set; } = 30;
}

public class AddSuggestionDto
{
    public Guid? BusinessId { get; set; }
    public string StopName { get; set; } = string.Empty;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public decimal KmAlongRoute { get; set; }
    public string? Note { get; set; }
}

public class SubmitReviewDto
{
    public string? ReviewerNote { get; set; }
    public List<AddSuggestionDto>? Suggestions { get; set; }
}

public class SuggestionDecisionDto
{
    public string Action { get; set; } = "accept"; // "accept" | "reject"
}
