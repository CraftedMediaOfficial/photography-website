(() => {
  const query = new URLSearchParams(location.search);
  const suppliedToken = query.get("token");
  if (suppliedToken) sessionStorage.setItem("crafted-studio-token", suppliedToken);
  history.replaceState({}, "", location.pathname);
  const token = sessionStorage.getItem("crafted-studio-token") || "";
  const root = document.querySelector("[data-content]");
  const status = document.querySelector("[data-status]");
  const saveButton = document.querySelector("[data-save]");
  let content;
  let dirty = false;

  const request = async (path, options = {}) => {
    const response = await fetch(path, { ...options, headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json", ...(options.headers || {}) } });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Request failed.");
    return result;
  };
  const element = (tag, properties = {}, children = []) => {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(properties)) {
      if (key === "className") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value);
    }
    node.append(...children.filter(Boolean));
    return node;
  };
  const changed = () => { dirty = true; status.textContent = "Unsaved changes"; saveButton.disabled = false; };
  const bind = (object, key, type = "text", label = key, options = {}) => {
    const control = type === "textarea" ? element("textarea") : type === "select" ? element("select") : element("input", { type });
    if (type === "select") for (const option of options.values || []) control.append(element("option", { value: option.value ?? option, text: option.label ?? option }));
    control.value = object[key] ?? "";
    control.addEventListener("input", () => { object[key] = type === "number" ? Number(control.value) : control.value || (options.nullable ? null : ""); changed(); });
    return element("label", { className: `field ${options.wide ? "wide" : ""}` }, [element("span", { text: label }), control]);
  };
  const visibility = (object) => bind(object, "visibility", "select", "Status", { values: ["draft", "published", "hidden"] });
  const move = (list, index, delta) => { const target = index + delta; if (target < 0 || target >= list.length) return; [list[index], list[target]] = [list[target], list[index]]; list.forEach((item, order) => { if ("displayOrder" in item) item.displayOrder = order + 1; }); changed(); render(); };
  const controls = (list, index, noun) => element("div", { className: "row-actions" }, [
    element("button", { type:"button", text:"Move up", onclick:() => move(list,index,-1) }),
    element("button", { type:"button", text:"Move down", onclick:() => move(list,index,1) }),
    element("button", { type:"button", className:"danger", text:`Remove ${noun}`, onclick:() => { if (confirm(`Remove this ${noun}?`)) { list.splice(index,1); changed(); render(); } } })
  ]);
  const panel = (id, title, description, body, add) => element("section", { className:"panel", id }, [
    element("div", { className:"panel-title" }, [element("div", {}, [element("h2", { text:title }), element("p", { text:description })]), add]), body
  ]);
  const empty = () => element("p", { className:"empty", text:"Nothing here yet." });
  const newSlug = (prefix) => `${prefix}-${Date.now().toString().slice(-6)}`;

  function render() {
    const categoryOptions = content.categories.map((item) => ({ label:item.name, value:item.slug }));
    const featured = element("div", { className:"check-list" }, content.categories.map((category) => {
      const checkbox = element("input", { type:"checkbox" });
      checkbox.checked = content.homepageFeatured.includes(category.slug);
      checkbox.disabled = !checkbox.checked && content.homepageFeatured.length >= 3;
      checkbox.addEventListener("change", () => { content.homepageFeatured = checkbox.checked ? [...content.homepageFeatured, category.slug].slice(0,3) : content.homepageFeatured.filter((slug) => slug !== category.slug); changed(); render(); });
      return element("label", {}, [checkbox, element("span", { text:category.name })]);
    }));
    const categoryItems = content.categories.map((category,index) => element("article", { className:"item" }, [
      element("h3", { text:category.name || "New category" }), element("div", { className:"grid" }, [bind(category,"name","text","Name"),bind(category,"slug","text","URL slug"),bind(category,"description","textarea","Description",{wide:true}),bind(category,"coverImage","text","Cover image path",{nullable:true}),bind(category,"displayOrder","number","Order"),visibility(category)]), controls(content.categories,index,"category")
    ]));
    const albumItems = content.albums.map((album,index) => {
      const photoItems = album.photos.map((photo,photoIndex) => element("div", { className:"item" }, [
        element("div", { className:"grid" }, [bind(photo,"src","text","Image path"),bind(photo,"srcSet","text","Responsive srcset",{nullable:true}),bind(photo,"alt","text","Alt text",{wide:true}),bind(photo,"caption","text","Caption",{wide:true,nullable:true}),bind(photo,"width","number","Width"),bind(photo,"height","number","Height"),bind(photo,"layout","select","Layout",{values:["standard","wide","portrait"]})]), controls(album.photos,photoIndex,"photo")
      ]));
      const addPhoto = element("button", { type:"button", text:"Add photo", onclick:() => { album.photos.push({src:"assets/uploads/",srcSet:null,width:1200,height:800,alt:"",caption:"",layout:"standard"}); changed(); render(); } });
      return element("article", { className:"item" }, [element("h3", { text:album.name || "New album" }),element("div",{className:"grid"},[bind(album,"name","text","Name"),bind(album,"slug","text","URL slug"),bind(album,"category","select","Category",{values:categoryOptions}),bind(album,"coverImage","text","Cover image path"),bind(album,"description","textarea","Description",{wide:true}),bind(album,"date","date","Date"),bind(album,"dateLabel","text","Date label"),bind(album,"location","text","Location"),bind(album,"displayOrder","number","Order"),visibility(album)]),controls(content.albums,index,"album"),element("div",{className:"nested"},[element("div",{className:"panel-title"},[element("h3",{text:`Photos (${album.photos.length})`}),addPhoto]),...(photoItems.length?photoItems:[empty()])])]);
    });
    const filmItems = content.films.map((film,index) => element("article",{className:"item"},[element("h3",{text:film.title||"New film"}),element("div",{className:"grid"},[bind(film,"title","text","Title"),bind(film,"type","text","Type"),bind(film,"thumbnail","text","Thumbnail path"),bind(film,"duration","text","Duration",{nullable:true}),bind(film,"description","textarea","Description",{wide:true}),bind(film,"videoUrl","text","Local video path",{nullable:true}),bind(film,"destinationUrl","url","External destination",{nullable:true}),bind(film,"embedUrl","url","Embed URL",{nullable:true}),bind(film,"displayOrder","number","Order"),visibility(film)]),controls(content.films,index,"film")]));
    const testimonialItems = content.testimonials.map((item,index) => element("article",{className:"item"},[element("div",{className:"grid"},[bind(item,"name","text","Client name"),bind(item,"context","text","Context"),bind(item,"quote","textarea","Quote",{wide:true}),bind(item,"displayOrder","number","Order"),visibility(item)]),controls(content.testimonials,index,"testimonial")]));
    const teamItems = content.about.team.map((member,index) => element("article",{className:"item"},[element("div",{className:"grid"},[bind(member,"name","text","Name"),bind(member,"role","text","Role"),bind(member,"description","textarea","Description",{wide:true})]),controls(content.about.team,index,"team member")]));
    const assetInput = element("input",{type:"file",accept:"image/jpeg,image/png,image/webp,image/avif"});
    const assetResult = element("div",{className:"upload-result",text:"Choose an image. It is copied to assets/uploads; optimization arrives in Phase 11."});
    const upload = element("button",{type:"button",text:"Add selected image",onclick:async() => { const file=assetInput.files[0]; if(!file)return; upload.disabled=true; status.textContent="Adding image…"; try { const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(",")[1]);reader.onerror=reject;reader.readAsDataURL(file);}); const result=await request("/api/assets",{method:"POST",body:JSON.stringify({name:file.name,type:file.type,data})}); assetResult.textContent=`Added: ${result.path} — copy this path into a photo or cover field.`; status.textContent="Image added; content not yet saved"; }catch(error){assetResult.textContent=error.message;status.textContent="Image upload failed";}finally{upload.disabled=false;} }});
    root.replaceChildren(
      panel("featured","Homepage featured work","Choose up to three published categories. Order follows the category order.",featured),
      panel("categories","Categories","Create, rename, reorder, hide or publish portfolio categories.",element("div",{},categoryItems.length?categoryItems:[empty()]),element("button",{type:"button",text:"Add category",onclick:()=>{content.categories.push({name:"New category",slug:newSlug("category"),description:"Add a category description.",coverImage:null,displayOrder:content.categories.length+1,visibility:"draft",albums:[]});changed();render();}})),
      panel("albums","Albums & photos","Move albums between categories, choose covers and manage ordered photographs.",element("div",{},albumItems.length?albumItems:[empty()]),element("button",{type:"button",text:"Add album",onclick:()=>{content.albums.push({name:"New album",slug:newSlug("album"),category:content.categories[0]?.slug||"",coverImage:"assets/uploads/",description:"Add an album description.",date:new Date().toISOString().slice(0,10),dateLabel:"",location:"",photos:[],videos:[],visibility:"draft",displayOrder:content.albums.length+1});changed();render();}})),
      panel("films","Films","Manage local video entries and approved HTTPS destinations or embeds.",element("div",{},filmItems.length?filmItems:[empty()]),element("button",{type:"button",text:"Add film",onclick:()=>{content.films.push({title:"New film",type:"Film",thumbnail:"assets/uploads/",description:"Add a film description.",videoUrl:null,destinationUrl:null,embedUrl:null,duration:null,displayOrder:content.films.length+1,visibility:"draft"});changed();render();}})),
      panel("testimonials","Testimonials","Only Published testimonials appear on the homepage.",element("div",{},testimonialItems.length?testimonialItems:[empty()]),element("button",{type:"button",text:"Add testimonial",onclick:()=>{content.testimonials.push({name:"Client name",context:"",quote:"Add the approved client quote.",displayOrder:content.testimonials.length+1,visibility:"draft"});changed();render();}})),
      panel("about","About & team","Update the founder profile and team cards.",element("div",{},[element("article",{className:"item"},[element("h3",{text:"Founder"}),element("div",{className:"grid"},[bind(content.about.founder,"name","text","Name"),bind(content.about.founder,"role","text","Role"),bind(content.about.founder,"introduction","textarea","Introduction",{wide:true})])]),element("div",{className:"nested"},[...teamItems,element("button",{type:"button",text:"Add team member",onclick:()=>{content.about.team.push({name:"New team member",role:"Role",description:"Add a short description."});changed();render();}})])])),
      panel("contact","Contact & social","Leave values blank until they are approved. URLs must use HTTPS.",element("div",{className:"grid"},[bind(content.contact,"phone","tel","Phone",{nullable:true}),bind(content.contact,"whatsappNumber","tel","WhatsApp number",{nullable:true}),bind(content.contact,"email","email","Email",{nullable:true}),bind(content.contact,"instagramUrl","url","Instagram URL",{nullable:true}),bind(content.contact,"formEndpoint","url","Form endpoint",{nullable:true,wide:true})])),
      panel("assets","Add image","Copies your own image into the project. Phase 11 will add automatic resizing and compression.",element("div",{},[assetInput,element("div",{className:"row-actions"},[upload]),assetResult]))
    );
  }

  saveButton.addEventListener("click", async () => { saveButton.disabled=true; status.textContent="Validating and saving…"; try { content=await request("/api/content",{method:"PUT",body:JSON.stringify(content)}); dirty=false; status.textContent="Saved locally"; render(); } catch(error) { status.textContent=error.message; saveButton.disabled=false; } });
  addEventListener("beforeunload", (event) => { if (dirty) { event.preventDefault(); event.returnValue=""; } });
  request("/api/content").then((result)=>{content=result;status.textContent="Local session authorized";saveButton.disabled=true;render();}).catch((error)=>{status.textContent=error.message;root.append(element("div",{className:"notice",text:"Open the exact private URL printed by npm run admin."}));});
})();
